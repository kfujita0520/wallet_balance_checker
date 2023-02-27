import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import WalletBalanceChecker from './WalletBalanceChecker';
import App from './App';

const AppRouter = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route exact path='/' element={<WalletBalanceChecker/>} />
          <Route path="/app" element={<App/>} />
        </Routes>
      </BrowserRouter>
  );
};

export default AppRouter;
