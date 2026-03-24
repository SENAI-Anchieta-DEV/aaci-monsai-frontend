import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MonitoramentoIoT from './components/MonitoramentoIoT';
import Home from './components/Home';
import Login from './components/Login';
import Lojinha from './components/Lojinha';
import Pagamento from './components/Pagamento';
import RecuperarSenha from './components/RecuperarSenha';
import { ToastProvider } from './components/ToastContext';


function App() {
  // tela pode ser: 'home' | 'lojinha' | 'pagamento' | 'login' | 'painel'
  const [tela, setTela] = useState('home');
  const [qty, setQty]   = useState(1);

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

  return (
    <ToastProvider>
    {tela === 'home'      && <Home      onIrParaLogin={() => setTela('login')} onIrParaLojinha={() => setTela('lojinha')} />}
    {tela === 'lojinha'   && <Lojinha   onVoltar={() => setTela('home')} onLogin={() => setTela('login')} onComprar={(q) => { setQty(q); setTela('pagamento'); }} />}
    {tela === 'pagamento' && <Pagamento onVoltar={() => setTela('lojinha')} onHome={() => setTela('home')} qty={qty} />}
    
    {/* Na tela de login, passe a prop para abrir a recuperação */}
    {tela === 'login'     && <Login     onLogin={() => setTela('painel')} onVoltar={() => setTela('home')} onRecuperar={() => setTela('recuperar')} />}
    
    {/* Nova tela de recuperação */}
    {tela === 'recuperar' && <RecuperarSenha onVoltar={() => setTela('login')} />}

    {tela === 'painel'    && (
      <div className="App">
        <MonitoramentoIoT onLogout={handleLogout} />
      </div>
    )}
  </ToastProvider>
  );
}

export default App;