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
import { h, FunctionalComponent } from 'preact';

import 'add-css:./styles.module.css';
import initialCss from 'prerender-css:';
import url, { allSrc, imports } from 'client-bundle:client/main';
import analyticsUrl from 'client-bundle:client/analytics/index.js';
import faviconURL from 'url:static-build/assets/favicon.png';
import socialImageURL from 'url:static-build/assets/social-large.png';
// import ogImage from 'url:static-build/assets/icon-large-maskable.png';
import { escapeStyleScriptContent, siteOrigin } from 'static-build/utils';
import App from 'shared/App';

interface Props {}

const Index: FunctionalComponent<Props> = () => (
  <html lang="en">
    <head>
      <title>Linear easing generator</title>
      <meta name="theme-color" content="#6aaa64" />
      <meta name="viewport" content="width=device-width, minimum-scale=1.0" />
      <link rel="icon" type="image/png" href={faviconURL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        property="twitter:image"
        content={`${siteOrigin}${socialImageURL}`}
      />
      <meta property="og:image" content={`${siteOrigin}${socialImageURL}`} />
      <meta name="twitter:site" content="@jaffathecake" />
      <meta property="og:url" content={`${siteOrigin}/`} />
      <meta property="og:title" content="Linear easing generator" />
      <meta
        property="og:description"
        content="Generate linear() from JavaScript and SVG"
      />
      <link rel="manifest" href="/manifest.json" />
      {
        <style
          dangerouslySetInnerHTML={{
            __html: escapeStyleScriptContent(initialCss),
          }}
        />
      }
      {imports.map((preload) => (
        <link rel="preload" href={preload} as="script" />
      ))}
      <script src={url} type="module" />
      <script src={analyticsUrl} async />
    </head>
    <body>
      <div id="app">
        <App />
      </div>
    </body>
  </html>
);

export default Index;
