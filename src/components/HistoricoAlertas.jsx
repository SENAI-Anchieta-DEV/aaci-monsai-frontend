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

    // 1. Buscar Histórico Inicial do Backend
    useEffect(() => {
        const carregarHistorico = async () => {
            try {
                // Substitua '/alertas' pela rota real do seu backend
                const response = await api.get('/alertas');
                setAlertas(response.data);
            } catch (error) {
                console.error("Erro ao buscar histórico de alertas:", error);
            }
        };
        carregarHistorico();
    }, []);

    // 2. Conexão WebSocket para receber alertas na mesma hora
    useEffect(() => {
        const stompClient = new Client({
            // Ajuste a URL base do seu servidor backend
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-monsai'),
            onConnect: () => {
                console.log("Conectado ao WebSocket de Alertas!");
                stompClient.subscribe('/topic/alertas', (mensagem) => {
                    const novoAlerta = JSON.parse(mensagem.body);
                    
                    // Adiciona o novo alerta no topo da lista (aba Novos)
                    setAlertas(prevAlertas => [novoAlerta, ...prevAlertas]);
                });
            }
        });
        stompClient.activate();
        return () => stompClient.deactivate();
    }, []);

    // 3. Regra dos 10 Minutos (Move automaticamente para aba "Antigos")
    useEffect(() => {
        const intervalId = setInterval(() => {
            const agora = new Date().getTime();
            
            setAlertas(prevAlertas => prevAlertas.map(alerta => {
                if (!alerta.visto) {
                    const tempoAlerta = new Date(alerta.data).getTime(); // ou alerta.dataHora dependendo do seu DTO
                    const diferencaMinutos = (agora - tempoAlerta) / (1000 * 60);

                    // Se passou de 10 minutos, marca como visto automaticamente
                    if (diferencaMinutos >= 10) {
                        // Opcional: Aqui você pode dar um api.put(`/alertas/${alerta.id}/visto`) para syncar com o BD
                        return { ...alerta, visto: true };
                    }
                }
                return alerta;
            }));
        }, 60000); // Roda a verificação a cada 1 minuto

        return () => clearInterval(intervalId);
    }, []);

    const novosAlertas = alertas.filter(a => !a.visto);
    const alertasAntigos = alertas.filter(a => a.visto);

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