type LineCharacter = { line: number, character: number };

/**
 * Container for errors
 */
export interface ErrorData {
  /**
   * Key is a file name, value is a collection of errors for this file
   */
  [key: string]: ErrorDetails[];
}

/**
 * Describes an error
 */
interface ErrorDetails {
  /**
   * Error message
   */
  message: string;
  /**
   * Error start character
   */
  start: LineCharacter;
   /**
   * Error end character
   */
  end: LineCharacter;
}