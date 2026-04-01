import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css'; 

import Home from './components/Home';
import Login from './components/Login';
import Lojinha from './components/Lojinha';
import Dashboard from './components/Dashboard';
import AdminSetup from './components/AdminSetup';

// Armazeno as rotas do sistema para evitar erros de digitação e facilitar manutenção
const SCREENS = {
  HOME: 'home',
  LOGIN: 'login',
  LOJINHA: 'lojinha',
  DASHBOARD: 'painel',
  ADMIN_SETUP: 'admin_setup'
};

function App() {
  // Inicializo os controladores principais de navegação e permissão
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [auth, setAuth] = useState({ isAuth: false, perfil: '', asiloId: null });

  // 1. Centralizo a lógica de autenticação usando useCallback para otimizar renderizações
  const applyAuth = useCallback((token, perfil, asiloId) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth({ isAuth: true, perfil, asiloId }); 
    
    // Roteio o usuário baseado no seu nível de privilégio
    if (perfil === 'SUPER_ADMIN') {
      setCurrentScreen(SCREENS.ADMIN_SETUP);
    } else {
      setCurrentScreen(SCREENS.DASHBOARD);
    }
  }, []);

  // 2. Verifico o LocalStorage ao abrir o app para manter a sessão ativa
  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('tipoPerfil');
    const asiloId = localStorage.getItem('asiloId'); 
    
    if (token && perfil) {
      applyAuth(token, perfil, asiloId);
    }
  }, [applyAuth]);

  // 3. Processo e persisto os dados recebidos após um login bem-sucedido
  const handleLoginSuccess = (dados) => {
    console.log('Dados recebidos do backend:', dados);
    
    // Padronizo a leitura do ID do asilo caso venha em formatos diferentes da API
    const asiloIdReal = dados.asilo?.id || dados.asiloId; 

    localStorage.setItem('token', dados.token);
    localStorage.setItem('tipoPerfil', dados.tipoPerfil);
    localStorage.setItem('asiloId', asiloIdReal); 
    
    applyAuth(dados.token, dados.tipoPerfil, asiloIdReal);
  };

  // Revogo os acessos e limpo o estado da aplicação
  const handleLogout = () => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization'];
    setAuth({ isAuth: false, perfil: '' });
    setCurrentScreen(SCREENS.HOME);
  };

  // 4. Decido qual componente renderizar com base no estado 'currentScreen'
  const renderContent = () => {
    switch (currentScreen) {
      case SCREENS.ADMIN_SETUP:
        return <AdminSetup onFinish={handleLogout} onLogout={handleLogout} />;
      
      case SCREENS.DASHBOARD:
        return <Dashboard perfil={auth.perfil} asiloId={auth.asiloId} onLogout={handleLogout} />;
      
      case SCREENS.LOJINHA:
        return <Lojinha onVoltar={() => setCurrentScreen(SCREENS.HOME)} onLogin={() => setCurrentScreen(SCREENS.LOGIN)} />;
      
      case SCREENS.LOGIN:
        return <Login onLogin={handleLoginSuccess} onVoltar={() => setCurrentScreen(SCREENS.HOME)} />;
      
      default:
        return <Home onIrParaLogin={() => setCurrentScreen(SCREENS.LOGIN)} onIrParaLojinha={() => setCurrentScreen(SCREENS.LOJINHA)} />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;