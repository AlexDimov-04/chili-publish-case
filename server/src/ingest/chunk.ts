import { existsSync } from 'node:fs';
import { relative } from 'node:path';
import {
  type ArrowFunction,
  type ClassDeclaration,
  type JSDocableNode,
  type MethodDeclaration,
  Node,
  Project,
  type PropertyDeclaration,
  Scope,
  type SourceFile,
  TypeFormatFlags,
} from 'ts-morph';
import { SDK_REPO_URL, SDK_VERSION } from '../config';

export type ChunkKind = 'method' | 'interface' | 'type' | 'enum';

export interface Chunk {
  /** Stable id, e.g. "method:FrameConstraintController.setHorizontalMovement". */
  id: string;
  /** Declaring symbol, e.g. "FrameConstraintController.setHorizontalMovement" or "FrameConstraints". */
  symbol: string;
  /** How a consumer calls a method, e.g. "sdk.frame.constraints.setHorizontalMovement"; absent for types. */
  apiPath?: string;
  kind: ChunkKind;
  /** Path relative to the studio-sdk repo root. */
  file: string;
  startLine: number;
  endLine: number;
  /** GitHub link pinned to the ingested tag. */
  url: string;
  /** Text that is embedded and shown to the model. */
  text: string;
}

const SDK_PACKAGE = 'packages/sdk';
const CONTROLLER_GLOB = `${SDK_PACKAGE}/src/controllers/*.ts`;
const TYPE_GLOBS = [`${SDK_PACKAGE}/src/types/*.ts`, `${SDK_PACKAGE}/src/utils/Enums.ts`];
const RETURN_TYPE_FLAGS = TypeFormatFlags.NoTruncation | TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

export interface ChunkOptions {
  /** Append the values of enum-typed parameters to method chunks (e.g. VariableType: list, shortText, …). */
  enumValues?: boolean;
}

/** Splits the pinned SDK source into one chunk per public controller method and one per exported type. */
export function chunkSdk(repoRoot: string, options: ChunkOptions = {}): Chunk[] {
  const project = loadProject(repoRoot);
  const sdkFile = project.getSourceFileOrThrow(`${repoRoot}/${SDK_PACKAGE}/src/sdk.ts`);
  const controllerFiles = project.getSourceFiles(`${repoRoot}/${CONTROLLER_GLOB}`);
  const classes = new Map(
    controllerFiles.flatMap((file) => file.getClasses()).map((cls) => [cls.getName() ?? '', cls]),
  );
  const apiPaths = resolveApiPaths(sdkFile, classes);
  const chunks: Chunk[] = [];

  for (const [className, apiPath] of apiPaths) {
    const cls = classes.get(className)!;
    for (const member of publicFunctionMembers(cls)) {
      const name = member.getName();
      chunks.push(
        toChunk(repoRoot, member, {
          kind: 'method',
          symbol: `${className}.${name}`,
          apiPath: `${apiPath}.${name}`,
          body: `${jsDocText(member)}${signature(member)}${options.enumValues ? enumValueLines(member) : ''}`,
        }),
      );
    }
  }

  for (const file of TYPE_GLOBS.flatMap((glob) => project.getSourceFiles(`${repoRoot}/${glob}`))) {
    const declarations = [
      ...file.getInterfaces().map((node) => ({ node, kind: 'interface' as const })),
      ...file.getTypeAliases().map((node) => ({ node, kind: 'type' as const })),
      ...file.getEnums().map((node) => ({ node, kind: 'enum' as const })),
    ];
    for (const { node, kind } of declarations) {
      if (!node.isExported()) continue;
      chunks.push(toChunk(repoRoot, node, { kind, symbol: node.getName(), body: node.getText(true) }));
    }
  }

  return chunks;
}

function loadProject(repoRoot: string): Project {
  const tsConfigFilePath = `${repoRoot}/${SDK_PACKAGE}/tsconfig.json`;
  // The SDK's tsconfig maps its workspace packages, so inferred return types resolve fully.
  const project = existsSync(tsConfigFilePath)
    ? new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: true })
    : new Project({ compilerOptions: { strict: true } });
  project.addSourceFilesAtPaths([`${repoRoot}/${SDK_PACKAGE}/src/sdk.ts`, `${repoRoot}/${CONTROLLER_GLOB}`, ...TYPE_GLOBS.map((g) => `${repoRoot}/${g}`)]);
  project.resolveSourceFileDependencies();
  return project;
}

/**
 * Maps controller class name -> consumer access path, e.g. FrameConstraintController -> "sdk.frame.constraints".
 * Roots are the public `Instrumented<XController>` fields of the SDK class; nested controllers are public
 * fields typed with another controller class. Classes not reachable this way (e.g. the private
 * SubscriberController) are not part of the consumer API and are skipped.
 */
function resolveApiPaths(sdkFile: SourceFile, classes: Map<string, ClassDeclaration>): Map<string, string> {
  const paths = new Map<string, string>();
  const queue: string[] = [];
  const visit = (className: string, path: string) => {
    if (!classes.has(className) || paths.has(className)) return;
    paths.set(className, path);
    queue.push(className);
  };

  for (const prop of sdkFile.getClassOrThrow('SDK').getProperties()) {
    const typeText = prop.getTypeNode()?.getText() ?? '';
    const match = /^Instrumented<(\w+)>$/.exec(typeText);
    if (match && isPublic(prop)) visit(match[1], `sdk.${prop.getName()}`);
  }

  while (queue.length > 0) {
    const className = queue.shift()!;
    for (const prop of classes.get(className)!.getProperties()) {
      // `child: ChildController;` or `child = new ChildController(...)`
      const typeText = prop.getTypeNode()?.getText() ?? /^new (\w+)\(/.exec(prop.getInitializer()?.getText() ?? '')?.[1];
      if (typeText && isPublic(prop)) visit(typeText, `${paths.get(className)}.${prop.getName()}`);
    }
  }
  return paths;
}

/** Public methods, written in the SDK either as `name = async (...) => {}` properties or as class methods. */
function publicFunctionMembers(cls: ClassDeclaration): (PropertyDeclaration | MethodDeclaration)[] {
  const arrowProps = cls.getProperties().filter((prop) => Node.isArrowFunction(prop.getInitializer()));
  return [...arrowProps, ...cls.getMethods()]
    .filter((member) => isPublic(member) && !member.isStatic())
    .sort((a, b) => a.getStart() - b.getStart());
}

function isPublic(member: PropertyDeclaration | MethodDeclaration): boolean {
  if (member.getName().startsWith('#')) return false;
  if (member.getScope() !== Scope.Public) return false;
  return !member.getJsDocs().some((doc) => doc.getTags().some((tag) => tag.getTagName() === 'ignore'));
}

function signature(member: PropertyDeclaration | MethodDeclaration): string {
  const fn = Node.isPropertyDeclaration(member) ? (member.getInitializer() as ArrowFunction) : member;
  const params = fn.getParameters().map((p) => p.getText()).join(', ');
  const returnType = fn.getReturnTypeNode()?.getText() ?? fn.getReturnType().getText(fn, RETURN_TYPE_FLAGS);
  return `${member.getName()}(${params}): ${returnType}`;
}

/**
 * One line per enum-typed parameter listing the enum's values. Methods like create(parentId, type: VariableType)
 * are generic over a subtype, so without this nothing in the chunk mentions e.g. "list".
 */
function enumValueLines(member: PropertyDeclaration | MethodDeclaration): string {
  const fn = Node.isPropertyDeclaration(member) ? (member.getInitializer() as ArrowFunction) : member;
  const lines = new Set<string>();
  for (const param of fn.getParameters()) {
    let declaration = param.getType().getNonNullableType().getSymbol()?.getDeclarations()[0];
    // A single-member enum is typed as its one literal member; walk up to the enum itself.
    if (declaration && Node.isEnumMember(declaration)) declaration = declaration.getParent();
    if (declaration && Node.isEnumDeclaration(declaration)) {
      lines.add(`// ${declaration.getName()}: ${declaration.getMembers().map((m) => m.getName()).join(', ')}`);
    }
  }
  return [...lines].map((line) => `\n${line}`).join('');
}

function jsDocText(node: JSDocableNode): string {
  // Drop the class-member indentation that JSDoc continuation lines keep from the source.
  return node.getJsDocs().map((doc) => `${doc.getText().replace(/^[ \t]+\*/gm, ' *')}\n`).join('');
}

function toChunk(
  repoRoot: string,
  node: Node,
  meta: { kind: ChunkKind; symbol: string; apiPath?: string; body: string },
): Chunk {
  const file = relative(repoRoot, node.getSourceFile().getFilePath());
  const startLine = node.getStartLineNumber(true);
  const endLine = node.getEndLineNumber();
  const header = meta.apiPath ? `// ${meta.apiPath} (${meta.symbol})` : `// ${meta.kind} ${meta.symbol}`;
  return {
    id: `${meta.kind}:${meta.symbol}`,
    symbol: meta.symbol,
    ...(meta.apiPath && { apiPath: meta.apiPath }),
    kind: meta.kind,
    file,
    startLine,
    endLine,
    url: `${SDK_REPO_URL}/blob/${SDK_VERSION}/${file}#L${startLine}-L${endLine}`,
    text: `${header}\n${meta.body}`,
  };
}
