import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import './App.css';
import InitPage from './pages/InitPage/InitPage';
import MainPage from './pages/MainPage/MainPage';
import { selectUser } from './store/slices/user/user';

function App() {
  const userState = useSelector(selectUser);
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className='App'>
        {userState.user === null ? (
          <BrowserRouter>
            <Routes>
              <Route path='/init' element={<InitPage />} />
              <Route path='*' element={<Navigate to='/init' replace />} />
            </Routes>
          </BrowserRouter>
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<MainPage />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </BrowserRouter>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
