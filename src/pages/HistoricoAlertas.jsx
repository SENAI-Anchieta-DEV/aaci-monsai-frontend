import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent,
  Chip, Button, Paper
} from '@mui/material';
import WarningAmberIcon        from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline';
import WifiIcon                from '@mui/icons-material/Wifi';
import WifiOffIcon             from '@mui/icons-material/WifiOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Client }   from '@stomp/stompjs';
import SockJS       from 'sockjs-client';
import api          from '../utils/api';

const HistoricoAlertas = () => {
  const [abaAtual, setAbaAtual] = useState(0);
  const [alertas,  setAlertas]  = useState([]);
  const [wsOnline, setWsOnline] = useState(false);

  // 1. Polling do cache
  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await api.get('/api/telemetria/alertas-recentes');
        setAlertas(response.data);
      } catch (error) {
        console.error("Erro ao sincronizar alertas recentes:", error);
      }
    };
    carregar();
    const id = setInterval(carregar, 5000);
    return () => clearInterval(id);
  }, []);

  // 2. WebSocket
  useEffect(() => {
    const isLocal   = window.location.hostname === "localhost";
    const socketUrl = isLocal
      ? 'http://localhost:8080/'
      : 'https://aaci-monsai-backend-mrxp.onrender.com/ws';

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      onConnect: () => {
        setWsOnline(true);
        stompClient.subscribe('/topic/alertas', (mensagem) => {
          const novoAlerta = JSON.parse(mensagem.body);
          setAlertas(prev => [novoAlerta, ...prev]);
        });
      },
      onStompError:    () => setWsOnline(false),
      onWebSocketClose: () => setWsOnline(false),
    });
    stompClient.activate();
    return () => { if (stompClient) stompClient.deactivate(); };
  }, []);

  // 3. Filtros — regra dos 10 minutos
  const agora = new Date().getTime();

  const novosAlertas = alertas.filter(a => {
    if (a.visto) return false;
    return (agora - new Date(a.data).getTime()) / 60000 < 10;
  });

  const alertasAntigos = alertas.filter(a => {
    if (a.visto) return true;
    return (agora - new Date(a.data).getTime()) / 60000 >= 10;
  });

  const handleMudancaAba = (_, novo) => setAbaAtual(novo);

  const marcarComoVisto = async (id) => {
    try {
      // await api.put(`/alertas/${id}/visto`);
      setAlertas(alertas.map(a => a.id === id ? { ...a, visto: true } : a));
    } catch (error) {
      console.error("Erro ao atualizar status do alerta:", error);
    }
  };

  const renderListaAlertas = (lista, isNovo) => {
    if (lista.length === 0) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'rgba(42,92,20,0.2)', mb: 1 }} />
          <Typography sx={{ color: '#7f8c8d', fontWeight: 600 }}>
            Nenhum alerta {isNovo ? "novo" : "antigo"} encontrado.
          </Typography>
        </Box>
      );
    }

    return lista.map(alerta => (
      <Card key={alerta.id} sx={{
        mb: 2,
        borderRadius: 4,
        border: '1px solid',
        borderColor: isNovo ? 'rgba(231,76,60,0.25)' : 'rgba(42,92,20,0.1)',
        boxShadow: isNovo
          ? '0 4px 20px rgba(231,76,60,0.08)'
          : '0 4px 16px rgba(42,92,20,0.05)',
        borderLeft: '5px solid',
        borderLeftColor: isNovo ? '#e74c3c' : '#95a5a6',
        transition: '0.25s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: isNovo ? '0 8px 28px rgba(231,76,60,0.13)' : '0 8px 24px rgba(42,92,20,0.09)' },
      }}>
        <CardContent sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 2, flexWrap: 'wrap', p: '20px !important',
        }}>
          <Box sx={{ flex: 1 }}>
            {/* Cabeçalho do alerta */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {isNovo
                ? <WarningAmberIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
                : <CheckCircleOutlineIcon sx={{ color: '#95a5a6', fontSize: 20 }} />}
              <Typography variant="h6" fontWeight={800} sx={{ color: '#1a3d0a', fontSize: '1rem' }}>
                {alerta.idosoNome}
              </Typography>
              <Typography variant="caption" sx={{
                color: '#7f8c8d', fontWeight: 600,
                bgcolor: '#f4f6f8', px: 1, borderRadius: 1,
              }}>
                ID: {alerta.idosoId}
              </Typography>
            </Box>

            {/* Data */}
            <Typography variant="caption" sx={{ color: '#95a5a6', fontWeight: 600, display: 'block', mb: 1.5 }}>
              {new Date(alerta.data).toLocaleString('pt-BR')}
            </Typography>

            {/* Chips de motivos */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {alerta.motivos?.map((motivo, i) => (
                <Chip
                  key={i}
                  label={motivo}
                  size="small"
                  sx={isNovo ? {
                    bgcolor: 'rgba(231,76,60,0.1)',
                    color: '#e74c3c',
                    fontWeight: 700,
                    border: '1px solid rgba(231,76,60,0.3)',
                  } : {
                    bgcolor: '#f4f6f8',
                    color: '#7f8c8d',
                    fontWeight: 600,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                />
              ))}
            </Box>
          </Box>

          {isNovo && (
            <Button
              variant="contained"
              size="small"
              onClick={() => marcarComoVisto(alerta.id)}
              sx={{
                bgcolor: '#1a3d0a', borderRadius: 2,
                fontWeight: 700, fontSize: '0.8rem',
                px: 2.5, py: 1, whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(26,61,10,0.25)',
                '&:hover': { bgcolor: '#2a5c14' },
              }}
            >
              Marcar como visto
            </Button>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography component="h2" variant="h4" sx={{ color: '#1a3d0a', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Histórico de Alertas
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Alertas Clínicos</Typography>
            <Chip
              size="small"
              icon={wsOnline
                ? <WifiIcon sx={{ fontSize: '14px !important' }} />
                : <WifiOffIcon sx={{ fontSize: '14px !important' }} />}
              label={wsOnline ? "WebSocket ativo" : "Polling ativo"}
              color={wsOnline ? "success" : "warning"}
              sx={{ fontWeight: 600, height: 24, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>

        {/* Contador de novos */}
        {novosAlertas.length > 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)',
            borderRadius: 3, px: 2, py: 1,
          }}>
            <NotificationsActiveIcon sx={{ color: '#e74c3c', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={800} sx={{ color: '#e74c3c' }}>
              {novosAlertas.length} alerta{novosAlertas.length > 1 ? 's' : ''} não visto{novosAlertas.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Abas */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(42,92,20,0.1)', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#f4f7f1', borderBottom: '1px solid rgba(42,92,20,0.1)', px: 2 }}>
          <Tabs
            value={abaAtual}
            onChange={handleMudancaAba}
            sx={{
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', color: '#4a6b3b', minHeight: 48 },
              '& .Mui-selected': { color: '#1a3d0a !important' },
              '& .MuiTabs-indicator': { bgcolor: '#2a5c14', height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Novos Alertas
                <Box sx={{
                  minWidth: 22, height: 22, borderRadius: '50%',
                  bgcolor: novosAlertas.length > 0 ? '#e74c3c' : 'rgba(0,0,0,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {novosAlertas.length}
                  </Typography>
                </Box>
              </Box>
            } />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Alertas Antigos
                <Box sx={{
                  minWidth: 22, height: 22, borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#555', lineHeight: 1 }}>
                    {alertasAntigos.length}
                  </Typography>
                </Box>
              </Box>
            } />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {abaAtual === 0 && renderListaAlertas(novosAlertas, true)}
          {abaAtual === 1 && renderListaAlertas(alertasAntigos, false)}
        </Box>
      </Paper>
    </Box>
  );
};

export default HistoricoAlertas;