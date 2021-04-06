import { ErrorData } from './ErrorData';

export interface DiagnosticData {
  errors: ErrorData;
  totalErrors: number;
  rootFolder: string;
}