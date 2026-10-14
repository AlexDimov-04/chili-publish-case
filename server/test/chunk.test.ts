import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chunkSdk } from '../src/ingest/chunk';

const root = new URL('./fixtures/mini-sdk', import.meta.url).pathname;
const controllerFile = 'packages/sdk/src/controllers/WidgetController.ts';
const chunks = chunkSdk(root);
const byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));

/** 1-based line of the first source line containing `text`. */
function lineOf(text: string): number {
  return readFileSync(`${root}/${controllerFile}`, 'utf8').split('\n').findIndex((l) => l.includes(text)) + 1;
}

describe('chunkSdk', () => {
  it('emits one chunk per public method reachable from the SDK class, with its consumer path', () => {
    const methods = chunks.filter((chunk) => chunk.kind === 'method');
    expect(methods.map((chunk) => chunk.apiPath)).toEqual([
      'sdk.widget.getAll',
      'sdk.widget.rename',
      'sdk.widget.lock.lock',
    ]);
    expect(methods.map((chunk) => chunk.symbol)).toEqual([
      'WidgetController.getAll',
      'WidgetController.rename',
      'WidgetLockController.lock',
    ]);
  });

  it('skips #private, private, @ignore members and unreachable controllers', () => {
    const symbols = chunks.map((chunk) => chunk.symbol).join(' ');
    expect(symbols).not.toMatch(/internalHelper|secret|hidden|api|OrphanController/);
  });

  it('records line ranges from the JSDoc start to the end of the member', () => {
    const rename = byId.get('method:WidgetController.rename')!;
    expect(rename.file).toBe(controllerFile);
    expect(rename.startLine).toBe(lineOf('Renames a widget') - 1);
    expect(rename.endLine).toBe(lineOf('void [id, name') + 1);
    expect(rename.url).toMatch(
      new RegExp(`/blob/\\d+\\.\\d+\\.\\d+/${controllerFile}#L${rename.startLine}-L${rename.endLine}$`),
    );
  });

  it('builds method text from path header, JSDoc and signature, inferring missing return types', () => {
    expect(byId.get('method:WidgetController.getAll')!.text).toBe(
      ['// sdk.widget.getAll (WidgetController.getAll)', '/**', ' * Returns all widgets', ' */', 'getAll(): Promise<Widget[]>'].join('\n'),
    );
    expect(byId.get('method:WidgetController.rename')!.text).toContain('rename(id: string, name: string): Promise<void>');
  });

  it('emits one chunk per exported interface, type alias and enum', () => {
    const types = chunks.filter((chunk) => chunk.kind !== 'method').map((chunk) => chunk.id);
    expect(types).toEqual(['interface:Widget', 'type:WidgetId', 'enum:WidgetKind']);
    expect(byId.get('interface:Widget')!.text).toBe(
      '// interface Widget\n/** A widget on the page */\nexport interface Widget {\n    id: string;\n}',
    );
  });
});
