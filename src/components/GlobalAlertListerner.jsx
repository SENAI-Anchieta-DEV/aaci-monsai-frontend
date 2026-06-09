import { useEffect, useRef } from 'react';
import api from '../utils/api';
import { useToast } from './ToastContext';

export default function GlobalAlertListener() {
    const showToast = useToast();
    const lastProcessedAlertId = useRef(null);

    useEffect(() => {
        console.log("📡 Ouvinte Global de Alertas (Polling) inicializado com sucesso!");

        const verificarAlertas = async () => {
            try {
                // 🚨 O PULO DO GATO: Busca o token atual direto do localStorage no momento da requisição
                const tokenAtual = localStorage.getItem("token");
                
                if (!tokenAtual) {
                    console.warn("⚠️ GlobalAlertListener: Token ainda não disponível no localStorage.");
                    return;
                }

                // Faz a chamada passando o cabeçalho explicitamente para garantir sincronia total
                const response = await api.get('/api/telemetria/alertas-recentes', {
                    headers: { Authorization: `Bearer ${tokenAtual}` }
                });
                
                const alertas = response.data;

                if (alertas && alertas.length > 0) {
                    const alertaMaisRecente = alertas[0]; // Pega o topo da lista (mais novo)

                    // Se for um alerta que ainda não processamos e não está marcado como visto no banco
                    if (alertaMaisRecente.id !== lastProcessedAlertId.current && !alertaMaisRecente.visto) {
                        
                        lastProcessedAlertId.current = alertaMaisRecente.id;

                        const motivosTexto = alertaMaisRecente.motivos && alertaMaisRecente.motivos.length > 0
                            ? alertaMaisRecente.motivos.join(" | ") 
                            : "Anomalia detectada nos sinais vitais.";

                        console.log(`🚨 Disparando Toast para o alerta ID: ${alertaMaisRecente.id}`);

                        // Dispara o Toast crítico vermelho na UI
                        showToast({
                            type: "error",
                            title: `🚨 ALERTA CRÍTICO: ${alertaMaisRecente.idosoNome}`,
                            message: `${motivosTexto}. Verifique o painel imediatamente!`,
                            duration: 10000 // 10 segundos para dar tempo do enfermeiro ver
                        });
                    }
                }
            } catch (error) {
                console.error("❌ Falha crítica no Polling de alertas globais:", error);
            }
        };

        // Roda imediatamente ao montar o componente pós-login
        verificarAlertas();
        
        // Mantém a checagem firme a cada 5 segundos
        const intervalId = setInterval(verificarAlertas, 5000);

        // Limpa o processo em background caso o usuário deslogue
        return () => {
            console.log("🛑 Ouvinte Global de Alertas desativado.");
            clearInterval(intervalId);
        };
    }, [showToast]);

    return null; 
}