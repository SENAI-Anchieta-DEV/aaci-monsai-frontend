import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css'; // Importando o estilo do colega para manter a identidade visual

// Componentes do seu projeto
import Home from './components/Home';
import Login from './components/Login';
import Lojinha from './components/Lojinha';
import Dashboard from './components/Dashboard';
import AdminSetup from './components/AdminSetup';

// Constantes - O segredo para não ter erro de digitação no futuro
const SCREENS = {
  HOME: 'home',
  LOGIN: 'login',
  LOJINHA: 'lojinha',
  DASHBOARD: 'painel',
  ADMIN_SETUP: 'admin_setup'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [auth, setAuth] = useState({ isAuth: false, perfil: '', asiloId: null });

  // 1. Lógica de Autenticação - Memorizada para evitar loops de render
  const applyAuth = useCallback((token, perfil, asiloId) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  setAuth({ isAuth: true, perfil, asiloId }); // <--- Salva aqui
  
  if (perfil === 'SUPER_ADMIN') {
    setCurrentScreen(SCREENS.ADMIN_SETUP);
  } else {
    setCurrentScreen(SCREENS.DASHBOARD);
  }
}, []);

  // 2. Persistência - Verifica se o usuário já estava logado ao abrir o app
useEffect(() => {
  const token = localStorage.getItem('token');
  const perfil = localStorage.getItem('tipoPerfil');
  const asiloId = localStorage.getItem('asiloId'); // <--- Recupera
  if (token && perfil) {
    applyAuth(token, perfil, asiloId);
  }
}, [applyAuth]);

  // 3. Handlers de Ação
  const handleLoginSuccess = (dados) => {
  localStorage.setItem('token', dados.token);
  localStorage.setItem('tipoPerfil', dados.tipoPerfil);
  localStorage.setItem('asiloId', dados.asiloId); // <--- Salva o ID real vindo do Java
  applyAuth(dados.token, dados.tipoPerfil, dados.asiloId);
};

  const handleLogout = () => {
    localStorage.clear(); // Limpa token e perfil de uma vez
    delete axios.defaults.headers.common['Authorization'];
    setAuth({ isAuth: false, perfil: '' });
    setCurrentScreen(SCREENS.HOME);
  };

  // 4. Renderizador - O "cérebro" da navegação
  const renderContent = () => {
    switch (currentScreen) {
      case SCREENS.ADMIN_SETUP:
        return <AdminSetup onFinish={handleLogout} onLogout={handleLogout} />;
      
      case SCREENS.DASHBOARD:
        // O Dashboard recebe o perfil para saber o que mostrar no Sidebar
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