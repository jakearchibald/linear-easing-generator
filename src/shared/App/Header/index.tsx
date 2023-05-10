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
import { signal } from '@preact/signals';

import 'add-css:./styles.module.css';
import * as styles from './styles.module.css';
import * as sharedStyles from '../styles.module.css';
import Select from '../Select';
import { bounce, elastic, materialEmphasized, spring } from '../demos';
import { State } from '../types';
import { hideFromPrerender } from '../utils';

const demos = {
  Spring: spring,
  Bounce: bounce,
  'Simple elastic': elastic,
  'Material Design emphasized easing': materialEmphasized,
} as const;

interface Props {
  onPresetSelect: (newState: Partial<State>) => void;
}

const presets = signal('Presets');

const Header: FunctionalComponent<Props> = ({ onPresetSelect }) => {
  const selectValue = signal('?');

  return (
    <header class={styles.siteHeader}>
      <h1 class={styles.siteTitle}>
        linear()<span class={styles.extendedTitle}> generator</span>
      </h1>
      <div style={hideFromPrerender}>
        <Select
          value={selectValue}
          displayedValue={presets}
          onChange={(newVal) => {
            const val = newVal as keyof typeof demos | '';
            if (val) onPresetSelect(demos[newVal as keyof typeof demos]);
          }}
        >
          {Object.keys(demos).map((name) => (
            <option value={name}>{name}</option>
          ))}
        </Select>
      </div>
      <a
        class={sharedStyles.sectionHeaderIconButton}
        href="https://github.com/jakearchibald/linear-easing-generator"
        target="_blank"
      >
        <span class={sharedStyles.sectionHeaderIconButtonText}>
          GitHub repository
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98 96">
          <path d="M48.85 0C21.84 0 0 22 0 49.22 0 70.97 14 89.39 33.4 95.9c2.43.49 3.32-1.06 3.32-2.37 0-1.14-.08-5.05-.08-9.12-13.59 2.93-16.42-5.87-16.42-5.87-2.18-5.7-5.42-7.17-5.42-7.17-4.45-3.01.33-3.01.33-3.01 4.93.32 7.52 5.05 7.52 5.05 4.37 7.5 11.4 5.38 14.23 4.07.4-3.18 1.7-5.38 3.08-6.6-10.84-1.14-22.25-5.38-22.25-24.28 0-5.38 1.94-9.78 5.02-13.2-.49-1.22-2.19-6.28.48-13.04 0 0 4.13-1.3 13.43 5.05a46.97 46.97 0 0 1 12.21-1.63 47 47 0 0 1 12.22 1.63c9.3-6.35 13.42-5.05 13.42-5.05 2.67 6.76.97 11.82.49 13.04a18.9 18.9 0 0 1 5.01 13.2c0 18.9-11.4 23.06-22.32 24.28 1.78 1.55 3.32 4.48 3.32 9.13 0 6.6-.08 11.9-.08 13.52 0 1.3.89 2.86 3.31 2.37a49.18 49.18 0 0 0 33.4-46.7C97.72 22 75.8 0 48.86 0z" />
        </svg>
      </a>
    </header>
  );
};

export default Header;
