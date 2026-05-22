import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ThemeProvider, CssBaseline } from '@mui/material';

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
import theme from './components/createTheme';
import { ToastProvider } from './components/ToastContext';

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
  const [secaoScroll, setSecaoScroll] = useState(null);
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

  const handleLoginSuccess = () => {
  const token   = localStorage.getItem('token');
  const perfil  = localStorage.getItem('tipoPerfil');
  const asiloId = localStorage.getItem('asiloId');
  applyAuth(token, perfil, asiloId);
};

  const handleLogout = () => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization'];
    setAuth({ isAuth: false, perfil: '' });
    setCurrentScreen(SCREENS.HOME);
  };

  const renderContent = () => {
    switch (currentScreen) {
      case SCREENS.ADMIN_SETUP:
        return <AdminSetup onFinish={() => setCurrentScreen(SCREENS.DASHBOARD)} 
            onLogout={() => setCurrentScreen(SCREENS.DASHBOARD)}/>;
      
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
        return <Home onIrParaLogin={() => setCurrentScreen(SCREENS.LOGIN)} onIrParaLojinha={() => setCurrentScreen(SCREENS.LOJINHA)} secaoParaRolar={secaoScroll} resetarScroll={() => setSecaoScroll(null)} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <ToastProvider>
      <div className="App">
        {/* A Navbar inserida no topo de forma global */}
        <Navbar 
        // Agora aceita dois parâmetros: para qual tela ir e, opcionalmente, qual seção rolar
           onNavigate={(tela, secao) => {
           setCurrentScreen(tela);
            if (secao) setSecaoScroll(secao);
    }} 
  currentScreen={currentScreen} 
/>
        
        {renderContent()}
      </div>
    </ToastProvider>
    </ThemeProvider>
  );
}

export default App;