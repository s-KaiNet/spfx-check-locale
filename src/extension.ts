import * as vs from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import { createSystem, createDefaultMapFromNodeModules, createVirtualCompilerHost } from '@typescript/vfs';
import { FileData } from './FileData';

const globalDefinition = 'declare var define: (...args) => any;';
const collection = vs.languages.createDiagnosticCollection('test');

export async function activate(context: vs.ExtensionContext) {

  console.log('Congratulations, your extension "spfx-check-locale" is now active!');

  if (!vs.workspace.workspaceFolders) {
    throw new Error('Unable to resolve workspace folder');
  }

  const rootWorkspace = vs.workspace.workspaceFolders[0];
  const currentFolder = rootWorkspace.uri.fsPath;

  const locDefinitionFiles = await vs.workspace.findFiles(new vs.RelativePattern(rootWorkspace, 'src/**/loc/*.d.ts'));


  //const results = await fg(['src/**/loc/*.d.ts'], { cwd: currentFolder, objectMode: true, absolute: true });

  for (const locDefinitionUri of locDefinitionFiles) {
    const locPath = path.dirname(locDefinitionUri.fsPath);
    const locDefinitionFileName = path.basename(locDefinitionUri.path);

    const locFiles = await vs.workspace.findFiles(new vs.RelativePattern(locPath, '*.js'));

    const locDefinitionContent = (await fs.promises.readFile(locDefinitionUri.fsPath)).toString();
    const sourceFile = ts.createSourceFile(locDefinitionFileName, locDefinitionContent, ts.ScriptTarget.Latest, true);
    const interfaceName = getInterfaceName(sourceFile);

    if (!interfaceName) {
      throw new Error('Unable to find interface name for file: ' + locDefinitionUri.path);
    }

    const filesData: FileData[] = [{
      fileName: 'global.d.ts',
      content: globalDefinition,
      uri: null
    }, {
      fileName: locDefinitionFileName,
      content: locDefinitionContent,
      uri: locDefinitionUri
    }];

    for (const locFileUri of locFiles) {
      const locContent = (await fs.promises.readFile(locFileUri.fsPath)).toString();
      const name = path.basename(locFileUri.path);
      const funcIndex = locContent.indexOf(')') + 1;
      const tsLocContent = [locContent.slice(0, funcIndex), `: ${interfaceName}`, locContent.slice(funcIndex)].join('');
      filesData.push({
        fileName: name.replace('.js', '.ts'),
        content: tsLocContent,
        uri: locFileUri
      });
    }

    const results = compile(filesData);
    highlightErrors(results, filesData);

    console.log(locDefinitionUri);
  }

  const disposable = vs.commands.registerCommand('spfx-check-locale.helloWorld', () => {
    vs.window.showInformationMessage('Hello World from SPFx Check Locale!');
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  //
}

// group by file?
function highlightErrors(diagnostics: readonly ts.Diagnostic[], files: FileData[]) {
  for (const diagnostic of diagnostics) {
    if (!diagnostic.file) {
      continue;
    }

    const fileName = diagnostic.file.fileName;
    const docUri = files.filter(f => f.fileName === fileName)[0].uri;

    const errorStart = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    const errorEnd = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start + diagnostic.length);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

    collection.set(docUri, [{
      code: '',
      severity: vs.DiagnosticSeverity.Error,
      source: '',
      message,
      range: new vs.Range(new vs.Position(errorStart.line, errorStart.character), new vs.Position(errorEnd.line, errorEnd.character)),
    }]);
  }
}

function getInterfaceName(node: ts.Node): string | null {
  if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
    return (node as ts.InterfaceDeclaration).name.escapedText.toString();
  }

  const children = node.getChildren();
  if (!children || children.length === 0) {
    return null;
  }

  for (const child of children) {
    const name = getInterfaceName(child);
    if (name) {
      return name;
    }
  }

  return null;
}

function compile(files: FileData[]): readonly ts.Diagnostic[] {
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
