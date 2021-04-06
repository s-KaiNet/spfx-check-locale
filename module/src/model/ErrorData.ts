type LineCharacter = { line: number, character: number };

export interface ErrorData {
  [key: string]: ErrorDetails[];
}

interface ErrorDetails {
  message: string;
  start: LineCharacter;
  end: LineCharacter;
}