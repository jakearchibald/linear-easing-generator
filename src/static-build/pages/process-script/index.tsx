import { h, Fragment, FunctionalComponent } from 'preact';

import { allSrc, imports } from 'client-bundle:client/frame';
import { escapeStyleScriptContent } from 'static-build/utils';

interface Props {}

const ProcessScript: FunctionalComponent<Props> = () => (
  <>
    {imports.map((preload) => (
      <link rel="preload" href={preload} as="script" />
    ))}
    <script
      dangerouslySetInnerHTML={{
        __html: escapeStyleScriptContent(allSrc),
      }}
    />
  </>
);

export default ProcessScript;
