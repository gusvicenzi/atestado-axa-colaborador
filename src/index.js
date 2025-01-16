import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import workflowStart from './integration/workflow';
import { GlobalStateProvider } from './globalState';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons
import "/node_modules/primeflex/primeflex.css"
import changeTaskNumber from './functions/changeTaskNumber';

function renderIndex(dadosDoProcesso, info) {
  // changeTaskNumber(dadosDoProcesso.dadosTarefa)
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <GlobalStateProvider>
      <React.StrictMode>
        <App data={dadosDoProcesso} info={info} />
      </React.StrictMode>
    </GlobalStateProvider>
  );
}

workflowStart(renderIndex);
