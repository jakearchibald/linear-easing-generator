/** @param {string} fileName */
export function fileNameToURL(fileName) {
  return fileName.replace(/^static\//, '/');
}
