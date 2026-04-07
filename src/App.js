import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import './App.css'; 

import Home from './pages/Home';
import Login from './pages/Login';
import Lojinha from './pages/Lojinha';
import RecuperarSenha from './pages/RecuperarSenha';
import AlterarSenha from './pages/AlterarSenha';
import Pagamento from './pages/Pagamento';
import Dashboard from './components/Dashboard';
import AdminSetup from './components/AdminSetup';
import { ToastProvider } from './components/ToastContext';

// Rotas do sistema para evitar erros de digitação e facilitar manutenção
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
  // Inicializa os controladores principais de navegação e permissão
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [auth, setAuth] = useState({ isAuth: false, perfil: '', asiloId: null });
  const [qty, setQty] = useState(1);

const applyAuth = useCallback((token, perfil, asiloId) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth({ isAuth: true, perfil, asiloId }); 
    
    if (perfil === 'SUPER_ADMIN') {
      setCurrentScreen(SCREENS.ADMIN_SETUP);
    } else {
      setCurrentScreen(SCREENS.DASHBOARD);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const perfil = localStorage.getItem('tipoPerfil');
    const asiloId = localStorage.getItem('asiloId'); 
    
    if (token && perfil) {
      applyAuth(token, perfil, asiloId);
    }
  }, [applyAuth]);


  // 3. Processa e persiste os dados recebidos após um login bem-sucedido
  const handleLoginSuccess = (dados) => {
  localStorage.setItem('token', dados.token);
  localStorage.setItem('tipoPerfil', dados.tipoPerfil);
  localStorage.setItem('usuarioId', dados.usuarioId);
  localStorage.setItem('nomeUsuario', dados.nome);
  
  localStorage.setItem('emailUsuario', dados.email || '');
  localStorage.setItem('cpfUsuario', dados.cpf || '');
  
  localStorage.setItem('asiloId', dados.asilo?.id || dados.asiloId);
  
  applyAuth(dados.token, dados.tipoPerfil, dados.asilo?.id || dados.asiloId);
};

  // Revoga os acessos e limpa o estado da aplicação
  const handleLogout = () => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization'];
    setAuth({ isAuth: false, perfil: '' });
    setCurrentScreen(SCREENS.HOME);
  };
  // 4. Decide qual componente renderizar com base no estado 'currentScreen'
  const renderContent = () => {
    switch (currentScreen) {
      case SCREENS.ADMIN_SETUP:
        return <AdminSetup onFinish={handleLogout} onLogout={handleLogout} />;
      
      case SCREENS.DASHBOARD:
        return <Dashboard perfil={auth.perfil} asiloId={auth.asiloId} onLogout={handleLogout} />;
      
      case SCREENS.LOJINHA:
        return (
          <Lojinha 
            onVoltar={() => setCurrentScreen(SCREENS.HOME)} 
            onLogin={() => setCurrentScreen(SCREENS.LOGIN)} 
            onComprar={(q) => { setQty(q); setCurrentScreen(SCREENS.PAGAMENTO); }} 
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
      <div className="App">
        {renderContent()}
      </div>
    </ToastProvider>
  );
}

export default App;