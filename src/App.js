import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Benvenuto from './pages/Benvenuto';
import Registrati from './pages/Registrati';
import Accedi from './pages/Accedi';
import Home from './pages/Home';
import Agora from './pages/Agora';
import Gruppi from './pages/Gruppi';
import Gruppo from './pages/Gruppo';
import Symposium from './pages/Symposium';
import Profilo from './pages/Profilo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Benvenuto />} />
        <Route path="/registrati" element={<Registrati />} />
        <Route path="/accedi" element={<Accedi />} />
        <Route path="/home" element={<Home />} />
        <Route path="/agora" element={<Agora />} />
        <Route path="/gruppi" element={<Gruppi />} />
        <Route path="/gruppi/:id" element={<Gruppo />} />
        <Route path="/symposium" element={<Symposium />} />
        <Route path="/profilo" element={<Profilo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;