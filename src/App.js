import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MonitoramentoIoT from './components/MonitoramentoIoT';
import Login from './Login';


function App() {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Reconfigura o axios com o token salvo
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLogado(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setLogado(false);
  }

  if (!logado) {
    return <Login onLogin={() => setLogado(true)} />;
  }

  return (
    <div className="App">
      <MonitoramentoIoT onLogout={handleLogout} />
    </div>
  );
}

export default App;
