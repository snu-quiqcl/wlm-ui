import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import InitPage from './InitPage/InitPage';
import MainPage from './MainPage/MainPage';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path='/init' element={<InitPage />} />
          <Route path='/' element={<MainPage />} />
          <Route path='*' element={<h1>Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
