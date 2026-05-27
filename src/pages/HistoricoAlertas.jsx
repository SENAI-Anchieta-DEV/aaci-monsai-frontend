import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Chip, Button, Divider } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '../utils/api'; // Sua configuração do Axios

const HistoricoAlertas = () => {
    const [abaAtual, setAbaAtual] = useState(0);
    const [alertas, setAlertas] = useState([]);

   // 1. Buscar Histórico do Cache em Tempo Real
useEffect(() => {
    const carregarAlertas = async () => {
        try {
            // USANDO O NOVO ENDPOINT QUE DEVOLVE OBJETOS REAIS
            const response = await api.get('/api/telemetria/alertas-recentes');
            setAlertas(response.data);
        } catch (error) {
            console.error("Erro ao sincronizar alertas recentes:", error);
        }
    };

    // Busca assim que a tela abre
    carregarAlertas();

    // Configura o Polling para atualizar a cada 5 segundos
    const intervalId = setInterval(carregarAlertas, 5000);

    // Limpa o intervalo se o enfermeiro mudar de página
    return () => clearInterval(intervalId);
}, []);

    // 2. Conexão WebSocket para receber alertas na mesma hora
useEffect(() => {
    // 1. Define as URLs (Mude o final para /ws ou o endpoint que definiu no Spring)
    const LOCAL_URL = 'http://localhost:8080/'; 
    const RENDER_URL = 'https://aaci-monsai-backend-mrxp.onrender.com/ws';

    // 2. Verifica se o seu app está rodando localmente
    const isLocal = window.location.hostname === "localhost";
    const socketUrl = isLocal ? LOCAL_URL : RENDER_URL;

    console.log(`🔌 Tentando conexão WebSocket em: ${socketUrl}`);

    const stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        onConnect: () => {
            console.log("✅ Conectado ao WebSocket de Alertas!");
            stompClient.subscribe('/topic/alertas', (mensagem) => {
                const novoAlerta = JSON.parse(mensagem.body);
                setAlertas(prevAlertas => [novoAlerta, ...prevAlertas]);
            });
        },
        onStompError: (frame) => {
            console.error('❌ Erro no STOMP:', frame.headers['message']);
        },
        onWebSocketClose: () => {
            console.warn('⚠️ Conexão WebSocket fechada.');
        }
    });

    stompClient.activate();

    return () => {
        if (stompClient) stompClient.deactivate();
    };
}, []);
    // 3. Regra dos 10 Minutos (Move automaticamente para aba "Antigos")
   const agora = new Date().getTime();

    // Filtra os Novos: Só entra se NÃO foi visto E tem menos de 10 minutos
    const novosAlertas = alertas.filter(alerta => {
        if (alerta.visto) return false; 
        
        const tempoAlerta = new Date(alerta.data).getTime();
        const minutosPassados = (agora - tempoAlerta) / (1000 * 60);
        
        return minutosPassados < 10;
    });

    // Filtra os Antigos: Entra se JÁ foi visto OU tem 10 minutos ou mais
    const alertasAntigos = alertas.filter(alerta => {
        if (alerta.visto) return true;
        
        const tempoAlerta = new Date(alerta.data).getTime();
        const minutosPassados = (agora - tempoAlerta) / (1000 * 60);
        
        return minutosPassados >= 10;
    });



    const handleMudancaAba = (event, novoValor) => setAbaAtual(novoValor);

    const marcarComoVisto = async (id) => {
        try {
            // Envia para o backend que o enfermeiro visualizou
            // await api.put(`/alertas/${id}/visto`);
            setAlertas(alertas.map(a => a.id === id ? { ...a, visto: true } : a));
        } catch (error) {
            console.error("Erro ao atualizar status do alerta:", error);
        }
    };

    const renderListaAlertas = (lista, isNovo) => {
        if (lista.length === 0) {
            return (
                <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                    Nenhum alerta {isNovo ? "novo" : "antigo"} encontrado.
                </Typography>
            );
        }

        return lista.map(alerta => (
            <Card key={alerta.id} sx={{ mb: 2, borderLeft: isNovo ? '6px solid #f44336' : '6px solid #9e9e9e' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isNovo ? <WarningAmberIcon color="error" /> : <CheckCircleOutlineIcon color="action" />}
                            Paciente: {alerta.idosoNome} (ID: {alerta.idosoId})
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Data e Hora: {new Date(alerta.data).toLocaleString()}
                        </Typography>
                        
                        {/* Renderiza as tags de motivos */}
                        {alerta.motivos && alerta.motivos.map((motivo, index) => (
                            <Chip 
                                key={index} 
                                label={motivo} 
                                color={isNovo ? "error" : "default"} 
                                variant={isNovo ? "filled" : "outlined"} 
                                size="small" 
                                sx={{ mr: 1, mt: 0.5 }} 
                            />
                        ))}
                    </Box>
                    
                    {isNovo && (
                        <Button variant="contained" color="error" onClick={() => marcarComoVisto(alerta.id)}>
                            Marcar como Visto
                        </Button>
                    )}
                </CardContent>
            </Card>
        ));
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Histórico de Alertas Clínicos
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={abaAtual} onChange={handleMudancaAba} textColor="primary" indicatorColor="primary">
                    <Tab label={`Novos Alertas (${novosAlertas.length})`} />
                    <Tab label={`Alertas Antigos (${alertasAntigos.length})`} />
                </Tabs>
            </Box>

            <Box sx={{ mt: 3 }}>
                {abaAtual === 0 && renderListaAlertas(novosAlertas, true)}
                {abaAtual === 1 && renderListaAlertas(alertasAntigos, false)}
            </Box>
        </Box>
    );
};

export default HistoricoAlertas;