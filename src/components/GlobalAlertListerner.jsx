import { useEffect, useRef } from 'react';
import api from '../utils/api';
import { useToast } from './ToastContext';

export default function GlobalAlertListener() {
    const showToast = useToast();
    const hasInitializedRef = useRef(false);
    const lastProcessedAlertId = useRef(null);

    useEffect(() => {
        console.log("📡 Ouvinte Global de Alertas (Polling) ativado!");

        const verificarAlertas = async () => {
            try {
                // Busca os alertas recentes usando o endpoint que já existe e funciona no seu backend!
                const response = await api.get('/api/telemetria/alertas-recentes');
                const alertas = response.data;

                if (alertas && alertas.length > 0) {
                    const alertaMaisRecente = alertas[0]; // Pega o primeiro da lista (mais novo)

                    // No primeiro carregamento, apenas registra o último alerta para não disparar aviso de coisas velhas que o enfermeiro já tratou
                    if (!hasInitializedRef.current) {
                        lastProcessedAlertId.current = alertaMaisRecente.id;
                        hasInitializedRef.current = true;
                        return;
                    }

                    // Se for um alerta genuinamente novo E que ainda não foi marcado como visto
                    if (alertaMaisRecente.id !== lastProcessedAlertId.current && !alertaMaisRecente.visto) {
                        
                        // Atualiza a referência para não repetir o aviso
                        lastProcessedAlertId.current = alertaMaisRecente.id;

                        const motivosTexto = alertaMaisRecente.motivos && alertaMaisRecente.motivos.length > 0
                            ? alertaMaisRecente.motivos.join(" | ") 
                            : "Anomalia detectada nos sinais vitais.";

                        // Dispara o Toast vermelho na tela do usuário
                        showToast({
                            type: "error",
                            title: `🚨 ALERTA CRÍTICO: ${alertaMaisRecente.idosoNome}`,
                            message: `${motivosTexto}. Verifique o painel imediatamente!`,
                            duration: 8000 
                        });
                    }
                }
            } catch (error) {
                // Erro silencioso para não poluir o console caso o usuário perca a internet por 1 segundo
                console.error("Falha ao verificar alertas globais:", error);
            }
        };

        // Verifica imediatamente ao carregar
        verificarAlertas();
        
        // Configura a checagem a cada 5 segundos
        const intervalId = setInterval(verificarAlertas, 5000);

        // Limpa o intervalo se o componente for desmontado (ex: ao fazer logout)
        return () => clearInterval(intervalId);
    }, [showToast]);

    return null; 
}