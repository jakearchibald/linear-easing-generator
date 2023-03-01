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
import { h } from 'preact';

import { renderPage, writeFiles } from './utils';
import IndexPage from './pages/index';
import * as socialIconURL from 'img-url:static-build/assets/social-icon.png';
import * as maskableIconURL from 'img-url:static-build/assets/maskable-icon.png';
import { lookup as lookupMime } from 'mime-types';

const manifestSize = ({ width, height }: { width: number; height: number }) =>
  `${width}x${height}`;

interface Output {
  [outputPath: string]: string;
}

const toOutput: Output = {
  'index.html': renderPage(<IndexPage />),
  'manifest.json': JSON.stringify({
    name: 'Wordle Analyzer',
    short_name: 'Wordle Analyzer',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#fff',
    theme_color: '#6aaa64',
    icons: [
      {
        src: maskableIconURL.default,
        type: lookupMime(maskableIconURL.default),
        sizes: manifestSize(maskableIconURL),
        purpose: 'maskable',
      },
      {
        src: socialIconURL.default,
        type: lookupMime(socialIconURL.default),
        sizes: manifestSize(socialIconURL),
      },
    ],
    description: 'Discover if your Wordle guesses were luck, or genius.',
    lang: 'en',
  }),
};

writeFiles(toOutput);
