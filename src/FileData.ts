import { Uri } from 'vscode';

export interface FileData {
  fileName: string;
  content: string;
  uri: Uri | null;
}