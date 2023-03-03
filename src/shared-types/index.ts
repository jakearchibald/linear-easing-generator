export interface ProcessScriptData {
  action: 'process-script';
  script: string;
  port: MessagePort;
}

export type LinearData = [pos: number, val: number][];
