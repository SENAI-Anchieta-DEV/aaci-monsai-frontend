import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MonitoramentoIoT = () => {
  const [dados, setDados] = useState({
  sinal_vital: { 
    temperatura_c: 0, 
    movimento: { queda_detectada: false } 
  }
});
  const [feedback, setFeedback] = useState(""); // Para AACI-184

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

  useEffect(() => {
    const timer = setInterval(atualizarDados, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
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