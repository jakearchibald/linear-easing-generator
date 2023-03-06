// This is a fork of https://github.com/stacktracejs/error-stack-parser/blob/master/error-stack-parser.js
// Removing some of the older browser support, and bits this project doesn't need.
import { StackDetails } from 'shared-types/index';

const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;

export default function parse(error: Error): StackDetails {
  if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
    return parseV8(error);
  } else if (error.stack) {
    return parseFFOrSafari(error);
  } else {
    throw new Error('Cannot parse given Error object');
  }
}

function extractLocation(urlLike: string) {
  // Fail-fast but return locations like "(native)"
  if (urlLike.indexOf(':') === -1) {
    return [urlLike];
  }

  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/[()]/g, ''));
  return [parts![1], parts![2] || undefined, parts![3] || undefined];
}

function parseV8(error: Error): StackDetails {
  let line = error
    .stack!.split('\n')
    .find((line) => line.match(CHROME_IE_STACK_REGEXP))!;

  if (line.indexOf('(eval ') > -1) {
    // Throw away eval information until we implement stacktrace.js/stackframe#8
    line = line
      .replace(/eval code/g, 'eval')
      .replace(/(\(eval at [^()]*)|(,.*$)/g, '');
  }
  let sanitizedLine = line
    .replace(/^\s+/, '')
    .replace(/\(eval code/g, '(')
    .replace(/^.*?\s+/, '');

  // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
  // case it has spaces in it, as the string is split on \s+ later on
  const location = sanitizedLine.match(/ (\(.+\)$)/);

  // remove the parenthesized location from the line, if it was matched
  sanitizedLine = location
    ? sanitizedLine.replace(location[0], '')
    : sanitizedLine;

  // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
  // because this line doesn't have function name
  const locationParts = extractLocation(location ? location[1] : sanitizedLine);
  const functionName = (location && sanitizedLine) || undefined;

  return {
    fileName: locationParts[0]!,
    functionName: functionName!,
    lineNumber: Number(locationParts[1]),
    columnNumber: Number(locationParts[2]),
  };
}

function parseFFOrSafari(error: Error): StackDetails {
  let line = error
    .stack!.split('\n')
    .find((line) => !line.match(SAFARI_NATIVE_CODE_REGEXP))!;

  // Throw away eval information until we implement stacktrace.js/stackframe#8
  if (line.indexOf(' > eval') > -1) {
    line = line.replace(
      / line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
      ':$1',
    );
  }

  if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
    // Safari eval frames only have function names and nothing else
    return {
      functionName: line,
    };
  } else {
    const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
    const matches = line.match(functionNameRegex);
    const functionName = matches && matches[1] ? matches[1] : undefined;
    const locationParts = extractLocation(line.replace(functionNameRegex, ''));

    return {
      fileName: locationParts[0]!,
      functionName: functionName!,
      lineNumber: Number(locationParts[1]),
      columnNumber: Number(locationParts[2]),
    };
  }
}
