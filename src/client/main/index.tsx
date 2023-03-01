import { h, render } from 'preact';
import App from 'shared/App';
import { addServiceWorker } from 'shared/App/utils';

render(<App />, document.getElementById('app')!);

addServiceWorker();
