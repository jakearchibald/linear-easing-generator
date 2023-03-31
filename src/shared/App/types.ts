export const enum CodeType {
  JS,
  SVG,
}

export const enum CodeHighlight {
  JS,
  SVG,
  CSS,
}

export interface State {
  codeType: CodeType;
  code: string;
  simplify: number;
  round: number;
}
