import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Provider } from 'mobx-react';
import ErrorBoundary from '@/component/ErrorBoundary';
import rootStore from '@/store';
import App from './App';
import { configure } from 'mobx';

configure({
    enforceActions: 'always',
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    observableRequiresReaction: true,
    disableErrorBoundaries: true,
});

const rootEl = document.getElementById('root');

if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <Provider {...rootStore}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </Provider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
