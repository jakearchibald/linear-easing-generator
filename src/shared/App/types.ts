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
  jsCode: string;
  svgCode: string;
  simplify: number;
  round: number;
}
