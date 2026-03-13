import logo from './logo.svg';
import './App.css';
import MonitoramentoIoT from './components/MonitoramentoIoT';

function App() {
  return (
    <div className="App">
      <h1>Sistema de Monitoramento</h1>
      {/* Chamada do seu componente de IoT */}
      <MonitoramentoIoT />
    </div>
  );
}

export default App;
