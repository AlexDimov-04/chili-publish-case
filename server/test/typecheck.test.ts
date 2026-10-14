import { describe, expect, it } from 'vitest';
import { typecheck, wrapSnippet } from '../src/check/typecheck';

describe('typecheck', () => {
  it('passes a correct snippet that uses sdk and an imported enum', () => {
    const result = typecheck(
      [
        "import { VariableType } from '@chili-publish/studio-sdk';",
        '',
        "const created = await sdk.variable.create('', VariableType.list);",
        'const id = created.parsedData;',
        "if (id) await sdk.variable.setListVariable(id, ['Banana', 'Apple']);",
        'const snapshot = await sdk.page.getSnapshot();',
        'await sdk.frame.constraints.setHorizontalMovement(\'frame-1\', true);',
      ].join('\n'),
    );
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it('fails a call to a method that does not exist, on the right snippet line', () => {
    const result = typecheck("const page = 1;\nawait sdk.page.getSnapshott();");
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].line).toBe(2);
    expect(result.errors[0].message).toMatch(/getSnapshott.*does not exist.*PageController/s);
  });

  it('fails a call with wrong argument types', () => {
    const result = typecheck("await sdk.variable.setListVariable('id', 'Banana');");
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toMatch(/not assignable to parameter of type 'string\[\]'/);
  });

  it('fails an import of a name the SDK does not export', () => {
    const result = typecheck("import { NotARealExport } from '@chili-publish/studio-sdk';\nawait sdk.page.getAll();");
    expect(result.ok).toBe(false);
    expect(result.errors[0].line).toBe(1);
  });
});

describe('wrapSnippet', () => {
  it('hoists multi-line imports and maps lines back to the snippet', () => {
    const { source, lineMap } = wrapSnippet(
      ["import {", '  VariableType,', "} from '@chili-publish/studio-sdk';", 'await sdk.page.getAll();'].join('\n'),
    );
    const fileLines = source.split('\n');
    expect(fileLines.slice(0, 3).join('\n')).toBe("import {\n  VariableType,\n} from '@chili-publish/studio-sdk';");
    const bodyLine = fileLines.indexOf('await sdk.page.getAll();');
    expect(fileLines[bodyLine - 1]).toMatch(/^export async function/);
    expect(lineMap[bodyLine]).toBe(4);
  });
});
