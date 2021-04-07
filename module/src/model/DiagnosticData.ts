import { ErrorData } from './ErrorData';

/**
 * Container for errors in a single localization folder, i.e. a folder with mystrings.d.ts file
 */
export interface DiagnosticData {
  /**
   * A key-value object, where a key is a file name, an object is a collection of errors for this file
   */
  errors: ErrorData;
  /**
   * Total amount of errors found in a folder
   */
  totalErrors: number;

  /**
   * A path to a folder with localization definition, i.e. mystrings.d.ts
   */
  rootFolder: string;
}