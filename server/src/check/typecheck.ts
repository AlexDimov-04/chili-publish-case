import { fileURLToPath } from 'node:url';
import { Project, ts } from 'ts-morph';

export interface TypecheckError {
  /** 1-based line in the snippet as returned to the user. */
  line: number;
  message: string;
}

export interface TypecheckResult {
  ok: boolean;
  errors: TypecheckError[];
}

// Lives in the server package so '@chili-publish/studio-sdk' resolves from its node_modules (pinned to SDK_VERSION).
const SNIPPET_FILE = fileURLToPath(new URL('../../__snippet__.ts', import.meta.url));

// One project for the process: lib files and the SDK typings are parsed once and reused across checks.
// ts-morph serves the TypeScript lib.*.d.ts files itself; everything else comes from the real file system.
const project = new Project({
  compilerOptions: {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    types: [],
    skipLibCheck: true,
  },
});

const IMPORT_START = /^\s*import\s/;
const IMPORT_END = /from\s+['"][^'"]+['"]\s*;?\s*$|^\s*import\s+['"][^'"]+['"]\s*;?\s*$/;

/**
 * Builds the file that is compiled: the snippet's imports, then the contract preamble (`sdk` is an
 * initialized StudioSDK), then the remaining snippet lines inside an async function.
 * Returns the source plus, for each file line, the snippet line it came from (0 = generated).
 */
export function wrapSnippet(code: string): { source: string; lineMap: number[] } {
  const lines = code.split('\n');
  const imports: { text: string; line: number }[] = [];
  const body: { text: string; line: number }[] = [];
  let inImport = false;
  lines.forEach((text, i) => {
    if (inImport || IMPORT_START.test(text)) {
      imports.push({ text, line: i + 1 });
      inImport = !IMPORT_END.test(text);
    } else {
      body.push({ text, line: i + 1 });
    }
  });

  const file = [
    ...imports,
    { text: "import type __StudioSDK from '@chili-publish/studio-sdk';", line: 0 },
    { text: 'declare const sdk: __StudioSDK;', line: 0 },
    { text: 'export async function __snippet(): Promise<void> {', line: 0 },
    ...body,
    { text: '}', line: 0 },
  ];
  return { source: file.map((l) => l.text).join('\n'), lineMap: file.map((l) => l.line) };
}

/** Type-checks a generated snippet against the installed @chili-publish/studio-sdk typings. */
export function typecheck(code: string): TypecheckResult {
  const { source, lineMap } = wrapSnippet(code);
  const snippetFile = project.createSourceFile(SNIPPET_FILE, source, { overwrite: true });
  const errors = snippetFile
    .getPreEmitDiagnostics()
    .filter((d) => d.getCategory() === ts.DiagnosticCategory.Error)
    .map((d) => ({
      line: lineMap[(d.getLineNumber() ?? 1) - 1] ?? 0,
      message: ts.flattenDiagnosticMessageText(d.compilerObject.messageText, '\n'),
    }));
  return { ok: errors.length === 0, errors };
}
