import { DiagnosticData } from './DiagnosticData';

/**
 * Return value for a check method
 */
export interface CheckResults {
  /**
   * A collection of errors and metadata for every localization folder in the solution
   */
  diagnosticData: DiagnosticData[];
  /**
   * All discovered localization folders in the solution
   */
  locFolders: string[];
}