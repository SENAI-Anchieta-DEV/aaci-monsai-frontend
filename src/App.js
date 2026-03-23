import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MonitoramentoIoT from './components/MonitoramentoIoT';
import Home    from './components/Home';
import Login   from './components/Login';
import Lojinha from './components/Lojinha';

function App() {
  // tela pode ser: 'home' | 'lojinha' | 'login' | 'painel'
  const [tela, setTela] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setTela('painel');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setTela('home');
  };

  if (tela === 'home')    return <Home onIrParaLogin={() => setTela('login')} onIrParaLojinha={() => setTela('lojinha')} />;
  if (tela === 'lojinha') return <Lojinha onVoltar={() => setTela('home')} onLogin={() => setTela('login')} />;
  if (tela === 'login')   return <Login onLogin={() => setTela('painel')} onVoltar={() => setTela('home')} />;

  return (
    <div className="App">
      <MonitoramentoIoT onLogout={handleLogout} />
    </div>
  );
}

export default App;