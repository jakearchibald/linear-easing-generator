/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const importPrefix = 'eval:';

export default function evalPlugin() {
  return {
    name: 'eval',
    async resolveId(id, importer) {
      if (!id.startsWith(importPrefix)) return;

      const plainId = id.slice(importPrefix.length);
      const result = await this.resolve(plainId, importer);
      if (!result) return;

      return importPrefix + result.id;
    },
    async load(id) {
      if (!id.startsWith(importPrefix)) return;

      const realId = id.slice(importPrefix.length);
      const module = await import(realId);
      let exportId = 0;

      return Object.entries(module)
        .map(
          ([name, value]) =>
            `const export${exportId} = ${JSON.stringify(
              value,
            )}; export { export${exportId++} as ${name} };`,
        )
        .join('');
    },
  };
}
