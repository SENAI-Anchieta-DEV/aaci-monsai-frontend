import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Home from './components/Home';
import Login from './components/Login';
import Lojinha from './components/Lojinha';
import Dashboard from './components/Dashboard';
import AdminSetup from './components/AdminSetup'; // Tela nova que criaremos

// Constantes para evitar erros de digitação (Magic Strings)
const SCREENS = {
  HOME: 'home',
  LOGIN: 'login',
  LOJINHA: 'lojinha',
  DASHBOARD: 'painel',
  ADMIN_SETUP: 'admin_setup'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [auth, setAuth] = useState({ isAuth: false, perfil: '' });

  // Centraliza a configuração do Axios e Estado
  const applyAuth = useCallback((token, perfil) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth({ isAuth: true, perfil });
    
    // Lógica de Redirecionamento Crítica:
    if (perfil === 'SUPER_ADMIN') {
      setCurrentScreen(SCREENS.ADMIN_SETUP);
    } else {
      setCurrentScreen(SCREENS.DASHBOARD);
    }
  }, []);

  // Persistência de Sessão
  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('tipoPerfil');
    if (token && perfil) {
      applyAuth(token, perfil);
    }
  }, [applyAuth]);

  const handleLoginSuccess = (dados) => {
    localStorage.setItem('token', dados.token);
    localStorage.setItem('tipoPerfil', dados.tipoPerfil);
    applyAuth(dados.token, dados.tipoPerfil);
  };

  const handleLogout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setAuth({ isAuth: false, perfil: '' });
    setCurrentScreen(SCREENS.HOME);
  };

  // Gerenciador de Renderização (Clean Code: substitui os vários 'ifs' soltos)
  const renderContent = () => {
    switch (currentScreen) {
      case SCREENS.ADMIN_SETUP:
        return <AdminSetup onLogout={handleLogout} />;
      case SCREENS.DASHBOARD:
        return <Dashboard perfil={auth.perfil} onLogout={handleLogout} />;
      case SCREENS.LOJINHA:
        return <Lojinha onVoltar={() => setCurrentScreen(SCREENS.HOME)} onLogin={() => setCurrentScreen(SCREENS.LOGIN)} />;
      case SCREENS.LOGIN:
        return <Login onLogin={handleLoginSuccess} onVoltar={() => setCurrentScreen(SCREENS.HOME)} />;
      default:
        return <Home onIrParaLogin={() => setCurrentScreen(SCREENS.LOGIN)} onIrParaLojinha={() => setCurrentScreen(SCREENS.LOJINHA)} />;
    }
  };

  return <div className="App">{renderContent()}</div>;
}

export default App;