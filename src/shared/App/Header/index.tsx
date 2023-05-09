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
import Select from '../Select';
import { bounce, elastic, materialEmphasized, spring } from '../demos';
import { State } from '../types';

const demos = {
  Spring: spring,
  Bounce: bounce,
  'Simple elastic': elastic,
  'Material Design emphasized easing': materialEmphasized,
} as const;

interface Props {
  onPresetSelect: (newState: Partial<State>) => void;
}

const Header: FunctionalComponent<Props> = ({ onPresetSelect }) => {
  const selectValue = signal('');

  return (
    <header class={styles.siteHeader}>
      <h1 class={styles.siteTitle}>linear()</h1>
      <Select
        value={selectValue}
        onChange={(newVal) => {
          const val = newVal as keyof typeof demos | '';
          if (val) onPresetSelect(demos[newVal as keyof typeof demos]);
        }}
      >
        <option value="">Presets</option>
        {Object.keys(demos).map((name) => (
          <option value={name}>{name}</option>
        ))}
      </Select>
    </header>
  );
};

export default Header;
