import { DiagnosticData } from './DiagnosticData';

export interface CheckResults {
  diagnosticData: DiagnosticData[];
  locFolders: string[];
}