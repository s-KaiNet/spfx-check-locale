import fg from 'fast-glob';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as path from 'path';

import { FileData } from '../model/FileData';
import { createDefaultMapFromNodeModules, createSystem, createVirtualCompilerHost } from '@typescript/vfs';
import { GlobalDefinition } from './consts';
import { ErrorData } from '../model/ErrorData';

export class Compiler {
  constructor(private definitionPath: string) { }

  public async compile(): Promise<ErrorData> {
    const locPath = path.dirname(this.definitionPath);
    const locDefinitionFileName = path.basename(this.definitionPath);

    const locFiles = await fg(['*.js'], {
      absolute: true,
      objectMode: true,
      onlyFiles: true,
      cwd: locPath
    });

    const locDefinitionContent = (await fs.promises.readFile(this.definitionPath)).toString();
    const interfaceName = this.getLocaleInterfaceName(locDefinitionContent);

    const filesData: FileData[] = [{
      fileName: 'global.d.ts',
      content: GlobalDefinition,
      path: null
    }, {
      fileName: locDefinitionFileName,
      content: locDefinitionContent,
      path: this.definitionPath
    }];

    for (const locFile of locFiles) {
      const locContent = (await fs.promises.readFile(locFile.path)).toString();
      const funcIndex = locContent.indexOf(')') + 1;
      const tsLocContent = [locContent.slice(0, funcIndex), `: ${interfaceName}`, locContent.slice(funcIndex)].join('');
      filesData.push({
        fileName: locFile.name.replace('.js', '.ts'),
        content: tsLocContent,
        path: locFile.path
      });
    }

    const diagnostics = this.compileInternal(filesData);
    if (!diagnostics || diagnostics.length === 0) {
      return null;
    }

    const result: ErrorData = {};

    for (const diagnostic of diagnostics) {
      if (!diagnostic.file || diagnostic.category !== ts.DiagnosticCategory.Error) {
        continue;
      }
      const fileName = diagnostic.file.fileName.replace('.ts', '.js');
      result[fileName] = result[fileName] || [];

      const start = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      const end = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start + diagnostic.length);

      if ((diagnostic.messageText as ts.DiagnosticMessageChain).next) {
        diagnostic.messageText = (diagnostic.messageText as ts.DiagnosticMessageChain).next[0];
      }
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

      result[fileName].push({
        message,
        start: start,
        end: end
      })
    }

    return result;
  }

  private compileInternal(files: FileData[]): readonly ts.Diagnostic[] {
    const fsMap = createDefaultMapFromNodeModules({ target: ts.ScriptTarget.ES5 });
    for (const file of files) {
      fsMap.set(file.fileName, file.content);
    }

    const system = createSystem(fsMap);

    const opts: ts.CompilerOptions = {
      noEmitOnError: true,
      skipDefaultLibCheck: true,
      skipLibCheck: true
    }

    const host = createVirtualCompilerHost(system, opts, ts)

    const program = ts.createProgram({
      rootNames: [...fsMap.keys()],
      options: opts,
      host: host.compilerHost,
    });

    return program.emit().diagnostics;
  }

  private getLocaleInterfaceName(locDefinitionContent: string): string {
    const sourceFile = ts.createSourceFile('strings.d.ts', locDefinitionContent, ts.ScriptTarget.Latest, true);
    return this.getInterfaceName(sourceFile);
  }

  private getInterfaceName(node: ts.Node): string | null {
    if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
      return (node as ts.InterfaceDeclaration).name.escapedText.toString();
    }

    const children = node.getChildren();
    if (!children || children.length === 0) {
      return null;
    }

    for (const child of children) {
      const name = this.getInterfaceName(child);
      if (name) {
        return name;
      }
    }

    return null;
  }
}