import { Signal, useSignal, useSignalEffect } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { LinearData } from 'shared-types/index';
import { CodeType } from '../types';
import {
  default as processEasing,
  ProcessScriptEasingError,
} from './processEasing';

const processingDebounce = 300;

export default function useFullPointGeneration(
  code: Signal<string>,
  type: Signal<CodeType>,
): [
  linearData: Signal<LinearData | null>,
  codeError: Signal<string>,
  name: Signal<string>,
] {
  const fullPoints = useSignal<LinearData | null>(null);
  const codeError = useSignal<string>('');
  const name = useSignal<string>('');
  const currentProcessingControllerRef = useRef<AbortController | null>(null);
  const processingTimeoutRef = useRef<number>(0);
  const firstProcessRef = useRef(true);
  const lastCodeTypeRef = useRef<CodeType | null>(null);

  useSignalEffect(() => {
    const lastCodeType = lastCodeTypeRef.current;
    lastCodeTypeRef.current = type.value;
    const currentCode = code.value;
    currentProcessingControllerRef.current?.abort();
    clearTimeout(processingTimeoutRef.current);

    async function process() {
      firstProcessRef.current = false;
      currentProcessingControllerRef.current = new AbortController();
      try {
        const [newName, points] = await processEasing(
          currentProcessingControllerRef.current.signal,
          currentCode,
          type.value,
        );
        fullPoints.value = points;
        codeError.value = '';
        name.value = newName;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        fullPoints.value = null;
        name.value = '';

        if (error instanceof ProcessScriptEasingError) {
          let errorString = error.message;
          if (
            error.fileName &&
            error.fileName.startsWith('data:') &&
            error.lineNumber &&
            error.columnNumber
          ) {
            errorString += ` at line ${error.lineNumber}, column ${error.columnNumber}`;
          }

          codeError.value = errorString;
        } else {
          codeError.value = (error as Error).message;
        }
      }
    }

    // Don't debounce the first call, or if code type changes
    if (firstProcessRef.current || type.value !== lastCodeType) {
      fullPoints.value = null;
      codeError.value = '';
      process();
    } else {
      processingTimeoutRef.current = (
        setTimeout as typeof window['setTimeout']
      )(process, processingDebounce);
    }
  });

  return [fullPoints, codeError, name];
}
