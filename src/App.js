import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import './App.css'; 

import Home from './pages/Home';
import Login from './pages/Login';
import Lojinha from './pages/Lojinha';
import RecuperarSenha from './pages/RecuperarSenha';
import AlterarSenha from './pages/AlterarSenha';
import Pagamento from './pages/Pagamento';
import Dashboard from './pages/Dashboard';
import AdminSetup from './pages/AdminSetup';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ToastContext';
import api from './utils/api'; 

const SCREENS = {
  HOME: 'home',
  LOGIN: 'login',
  LOJINHA: 'lojinha',
  DASHBOARD: 'painel',
  ADMIN_SETUP: 'admin_setup',
  RECUPERAR: 'recuperar',
  ALTERAR: 'alterar',
  PAGAMENTO: 'pagamento'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [auth, setAuth] = useState({ isAuth: false, perfil: '', asiloId: null });
  const [qty, setQty] = useState(1);

  const applyAuth = useCallback((token, perfil, asiloId) => {
    // Seta headers do Axios Padrão e do API Customizado
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (api) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setAuth({ isAuth: true, perfil, asiloId: asiloId ? Number(asiloId) : null }); 
    
    // Roteamento inteligente baseado no perfil do usuário
    if (perfil === 'SUPER_ADMIN') {
      setCurrentScreen(SCREENS.ADMIN_SETUP);
    } else {
      setCurrentScreen(SCREENS.DASHBOARD);
    }
  }, []);

  // Monitora o localStorage ao abrir o App
  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('tipoPerfil');
    const asiloId = localStorage.getItem('asiloId'); 
    
    if (token && perfil) {
      applyAuth(token, perfil, asiloId);
    }
  }, [applyAuth]);

  // Função disparada no retorno do componente <Login />
  const handleLoginSuccess = () => {
    const token   = localStorage.getItem('token');
    const perfil  = localStorage.getItem('tipoPerfil');
    const asiloId = localStorage.getItem('asiloId');
    applyAuth(token, perfil, asiloId);
  };

  // ⚠️ MODIFICAÇÃO: Função central de Logout que destrói a sessão e volta para o Login Limpo
  const handleLogoutGlobal = useCallback(() => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization'];
    if (api) delete api.defaults.headers.common['Authorization'];
    
    setAuth({ isAuth: false, perfil: '', asiloId: null });
    setCurrentScreen(SCREENS.LOGIN); 
  }, []);

  const renderContent = () => {
    switch (currentScreen) {
      case SCREENS.ADMIN_SETUP:
        return (
          <AdminSetup 
            // ⚠️ MODIFICAÇÃO: Após terminar o setup, força logout em vez de ir pra Dash vazia
            onFinish={handleLogoutGlobal} 
            // ⚠️ MODIFICAÇÃO: Botão Sair faz logout completo
            onLogout={handleLogoutGlobal} 
          />
        );
      
      case SCREENS.DASHBOARD:
        return <Dashboard perfil={auth.perfil} asiloId={auth.asiloId} onLogout={handleLogoutGlobal} />;
      
      case SCREENS.LOJINHA:
        return (
          <Lojinha 
            onVoltar={() => setCurrentScreen(SCREENS.HOME)} 
            onLogin={() => setCurrentScreen(SCREENS.LOGIN)} 
            onComprar={(q) => { 
              setQty(q); 
              setTimeout(() => {
                setCurrentScreen(SCREENS.PAGAMENTO);
              }, 0);
            }} 
          />
        );
      
      case SCREENS.PAGAMENTO:
        return <Pagamento onVoltar={() => setCurrentScreen(SCREENS.LOJINHA)} onHome={() => setCurrentScreen(SCREENS.HOME)} qty={qty} />;

      case SCREENS.LOGIN:
        return (
          <Login 
            onLogin={handleLoginSuccess} 
            onVoltar={() => setCurrentScreen(SCREENS.HOME)} 
            onRecuperar={() => setCurrentScreen(SCREENS.RECUPERAR)} 
          />
        );

      case SCREENS.RECUPERAR:
        return <RecuperarSenha onVoltar={() => setCurrentScreen(SCREENS.LOGIN)} onProximo={() => setCurrentScreen(SCREENS.ALTERAR)} />;

      case SCREENS.ALTERAR:
        return <AlterarSenha onSucesso={() => setCurrentScreen(SCREENS.LOGIN)} onVoltar={() => setCurrentScreen(SCREENS.RECUPERAR)} />;
      
      default:
        return <Home onIrParaLogin={() => setCurrentScreen(SCREENS.LOGIN)} onIrParaLojinha={() => setCurrentScreen(SCREENS.LOJINHA)} />;
    }
  };

  return (
    <ToastProvider>
      <Navbar onNavigate={(screen) => setCurrentScreen(screen)} currentScreen={currentScreen} />
      {renderContent()}
    </ToastProvider>
  );
}

export default App;