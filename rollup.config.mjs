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
import * as path from 'path';
import { fileURLToPath } from 'url';
import fsp from 'fs/promises';

import { deleteAsync } from 'del';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import OMT from '@surma/rollup-plugin-off-main-thread';

import simpleTS from './lib/simple-ts.mjs';
import { fileNameToURL } from './lib/utils.mjs';
import clientBundlePlugin from './lib/client-bundle-plugin.mjs';
import nodeExternalPlugin from './lib/node-external-plugin.mjs';
import urlPlugin from './lib/url-plugin.mjs';
import cssPlugin from './lib/css-plugin.mjs';
import resolveDirsPlugin from './lib/resolve-dirs-plugin.mjs';
import runScript from './lib/run-script.mjs';
import emitFiles from './lib/emit-files-plugin.mjs';
import serviceWorkerPlugin from './lib/sw-plugin.mjs';
import entryDataPlugin from './lib/entry-data-plugin.mjs';
import entryURLPlugin from './lib/entry-url-plugin.mjs';
import evalPlugin from './lib/eval-plugin.mjs';

import packageJSON from './package.json' assert { type: 'json' };

const __MAJOR_VERSION__ = Number(packageJSON.version.split('.')[0]);

function resolveFileUrl({ fileName }) {
  return JSON.stringify(fileNameToURL(fileName));
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = '.tmp/build';
const staticPath = 'static/c/[name]-[hash][extname]';
const jsPath = staticPath.replace('[extname]', '.js');

function jsFileName(chunkInfo) {
  if (!chunkInfo.facadeModuleId) return jsPath;
  const parsedPath = path.parse(chunkInfo.facadeModuleId);
  if (parsedPath.name !== 'index') return jsPath;
  // Come up with a better name than 'index'
  const name = parsedPath.dir.split(/\\|\//).slice(-1);
  return jsPath.replace('[name]', name);
}

export default async function ({ watch }) {
  await deleteAsync('.tmp/build');

  const isProduction = !watch;

  const tsPluginInstance = simpleTS('.', {
    watch,
  });

  const omtLoaderPromise = fsp.readFile(
    path.join(__dirname, 'lib', 'omt.ejs'),
    'utf-8',
  );

  const commonPlugins = () => [
    tsPluginInstance,
    resolveDirsPlugin([
      'src/static-build',
      'src/client',
      'src/shared',
      'src/workers',
    ]),
    urlPlugin(),
    cssPlugin(),
  ];

  return {
    input: './src/static-build/index.tsx',
    output: {
      dir,
      format: 'cjs',
      assetFileNames: staticPath,
      exports: 'named',
      preserveModules: true,
    },
    watch: {
      clearScreen: false,
      // Don't watch the ts files. Instead we watch the output from the ts compiler.
      exclude: ['**/*.ts', '**/*.tsx'],
      // Sometimes TypeScript does its thing a little slowly, which causes
      // Rollup to build twice on each change. This delay seems to fix it,
      // although we may need to change this number over time.
      buildDelay: 250,
    },
    plugins: [
      { resolveFileUrl },
      clientBundlePlugin(
        {
          plugins: [
            { resolveFileUrl },
            OMT({ loader: await omtLoaderPromise }),
            serviceWorkerPlugin({
              output: 'static/sw.js',
            }),
            entryURLPlugin(),
            ...commonPlugins(),
            evalPlugin(),
            commonjs(),
            resolve(),
            replace({
              values: {
                __PRERENDER__: false,
                __PRODUCTION__: isProduction,
                __MAJOR_VERSION__,
              },
              preventAssignment: true,
            }),
            entryDataPlugin(),
            isProduction ? terser({ module: true }) : {},
          ],
          preserveEntrySignatures: false,
        },
        {
          dir,
          format: 'amd',
          chunkFileNames: jsFileName,
          entryFileNames: jsFileName,
        },
        resolveFileUrl,
      ),
      ...commonPlugins(),
      emitFiles({ include: '**/*', root: path.join(__dirname, 'src', 'copy') }),
      nodeExternalPlugin(),
      replace({
        values: {
          __PRERENDER__: true,
          __PRODUCTION__: isProduction,
          __MAJOR_VERSION__,
        },
        preventAssignment: true,
      }),
      runScript(dir + '/index.js'),
    ],
  };
}
