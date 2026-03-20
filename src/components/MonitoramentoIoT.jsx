import React, { useState, useEffect } from 'react';
import axios from 'axios';



const MonitoramentoIoT = ({ onLogout }) => {
  const [dados, setDados] = useState({
  sinal_vital: { 
    temperatura_c: 0, 
    movimento: { queda_detectada: false } 
  }
});
  const [feedback, setFeedback] = useState(""); // Para AACI-184

   const [erro, setErro] = useState(null);

    const buscarDados = async () => {
      try {
        // O token já está configurado no axios pelo App.js
        const response = await axios.get('http://localhost:8080/api/telemetria/ultima');
        setDados(response.data);
        setErro(null);
      } catch (error) {
        // Se retornar 401, o token expirou — desloga
        if (error.response?.status === 401) {
          alert("Sessão expirada, faça login novamente.");
          onLogout();
        } else {
          setErro("Erro ao buscar dados.");
        }
      }
    };

    useEffect(() => {
    buscarDados();
    const timer = setInterval(atualizarDados, 3000);
    return () => clearInterval(timer);
  }, []);


  if (erro) return <p>{erro}</p>;
  // if (!dados) return <p>Carregando dados...</p>;

  // AACI-182: Busca o estado mais recente do Backend
  const atualizarDados = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/telemetria/ultima?t=${Date.now()}`);
      console.log("Dados recebidos do backend:", res.data);
      setDados(res.data);
    } catch (err) {
      console.error("Erro ao buscar dados do IoT");
    }
  };

  
  // AACI-183: Enviar comando simples
 const enviarComando = async () => {
    try {
        await axios.post('http://localhost:8080/api/telemetria/comando-led');
        setFeedback("✅ Comando enviado ao hardware!");
    } catch (error) {
        setFeedback("❌ Erro ao enviar comando.");
    }
};

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
      <button onClick={onLogout}>Sair</button>
      {/* Renderize seus dados aqui */}
      <pre>{JSON.stringify(dados, null, 2)}</pre>
      <h3>Painel MONSAI (IoT)</h3>
      <p>🌡️ Temperatura: {dados?.sinal_vital?.temperatura_c ?? "Carregando..."}°C</p>
      <p>⚠️ Queda: {dados?.sinal_vital?.movimento?.queda_detectada ? "SIM" : "NÃO"}</p>
      <hr />
      
      <button onClick={enviarComando}>Testar LED do ESP32</button>
      <p><small>{feedback}</small></p>
    </div>
  );
};

export default MonitoramentoIoT;