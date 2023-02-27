import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import WalletBalanceChecker from "./WalletBalanceChecker";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <Routes>
              <Route exact path='/' element={<WalletBalanceChecker/>} />
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
);


