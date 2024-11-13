import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import './App.css';
import InitPage from './InitPage/InitPage';
import MainPage from './MainPage/MainPage';
import { selectUser } from './store/slices/user/user';

function App() {
  const userState = useSelector(selectUser);

  return (
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
  );
}

export default App;
