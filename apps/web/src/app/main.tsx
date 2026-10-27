import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/global.css';
import { App } from './App';

const raiz = document.getElementById('root');

// Falha explicita e cedo: um index.html sem #root e defeito de build, nao algo para
// degradar em silencio.
if (raiz === null) {
  throw new Error('Elemento #root não encontrado em index.html.');
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
