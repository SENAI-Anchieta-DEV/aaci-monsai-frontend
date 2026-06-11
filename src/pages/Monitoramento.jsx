import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Modal, Button, Card, CardContent, Typography, Box, IconButton, Chip, TextField, Divider, Tooltip, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';

// Ícones
import EditIcon                from '@mui/icons-material/Edit';
import DeleteIcon              from '@mui/icons-material/Delete';
import FavoriteIcon            from '@mui/icons-material/Favorite';
import ThermostatIcon          from '@mui/icons-material/Thermostat';
import DirectionsRunIcon       from '@mui/icons-material/DirectionsRun';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WifiIcon                from '@mui/icons-material/Wifi';
import WifiOffIcon             from '@mui/icons-material/WifiOff';
import LightbulbCircleIcon     from '@mui/icons-material/LightbulbCircle';
import WarningAmberIcon        from '@mui/icons-material/WarningAmber';
import CheckCircleIcon         from '@mui/icons-material/CheckCircle';
import ReportProblemIcon       from '@mui/icons-material/ReportProblem';

import api               from '../utils/api';
import { useAuth }       from '../hooks/useAuth';
import { validarNome, validarCPF, validarEmail, coletarErros } from '../utils/validators';
import { mascararCPF }   from '../utils/masks';

// ─── Helpers Visuais ──────────────────────────────────────────────────────────
const lerTelemetria = (telemetria, pulseiraSerial) => telemetria[pulseiraSerial] || {};
const corMovimento  = (status) => status === "QUEDA!" ? '#e74c3c' : '#2ecc71';
const corBpm        = (bpm)    => (!bpm  ? '#95a5a6' : (bpm  < 60 || bpm  > 100  ? '#e67e22' : '#2ecc71'));
const corTemp       = (temp)   => (!temp ? '#95a5a6' : (temp >= 37.8 ? '#e74c3c' : (temp < 35.5 ? '#3498db' : '#2ecc71')));
const corBateria    = (nivel)  => (!nivel ? '#95a5a6' : (nivel <= 20 ? '#e74c3c' : (nivel <= 50 ? '#f39c12' : '#2ecc71')));
const estaAoVivo    = (ultimaAtualizacao) => ultimaAtualizacao && (Date.now() - ultimaAtualizacao) < 15000;

export default function Monitoramento() {
  const [idosos,         setIdosos]         = useState([]);
  const [termoPesquisa,  setTermoPesquisa]  = useState("");
  const [telemetria,     setTelemetria]     = useState({});
  const [openModal,      setOpenModal]      = useState(false);
  const [idosoEditando,  setIdosoEditando]  = useState(null);
  const [erros,          setErros]          = useState({});
  const [ultimaSync,     setUltimaSync]     = useState(null);
  const [erroPolling,    setErroPolling]    = useState(false);

  const historicoBpm = useRef({});
  const { perfil, usuarioId } = useAuth();
  const podeEditar = perfil === 'GESTOR' || perfil === 'ROLE_GESTOR';

  const fetchIdosos = useCallback(async () => {
    try {
      const endpoint = (perfil === 'FAMILIAR' || perfil === 'ROLE_FAMILIAR')
        ? `/usuarios/${usuarioId}/idosos`
        : '/idosos';
      const response = await api.get(endpoint);
      setIdosos(response.data);
    } catch (error) { console.error("Erro ao buscar idosos", error); }
  }, [perfil, usuarioId]);

  useEffect(() => { fetchIdosos(); }, [fetchIdosos]);

  useEffect(() => {
    if (idosos.length === 0) return;
    const interval = setInterval(async () => {
      try {
        const res   = await api.get("/api/telemetria/ultima");
        const dados = res.data;
        if (!dados) return;

        const isMapa = typeof dados === 'object' && !dados.pulseira_id;
        const lista  = isMapa ? Object.values(dados) : [dados];

        setTelemetria((prev) => {
          const atualizado = { ...prev };
          lista.forEach((dto) => {
            if (!dto?.pulseira_id) return;
            const id = dto.pulseira_id;
            if (!historicoBpm.current[id]) historicoBpm.current[id] = [];
            historicoBpm.current[id].push(dto.sinal_vital?.frequencia_cardiaca_bpm);
            if (historicoBpm.current[id].length > 10) historicoBpm.current[id].shift();

            atualizado[id] = {
              bpm:              dto.sinal_vital?.frequencia_cardiaca_bpm,
              temp:             dto.sinal_vital?.temperatura_c,
              acelerometro:     dto.sinal_vital?.movimento?.queda_detectada ? "QUEDA!" : "Normal",
              bateria:          dto.status_do_dispositivo?.nivel_bateria,
              ultimaAtualizacao: Date.now(),
            };
          });
          return atualizado;
        });
        setUltimaSync(new Date());
        setErroPolling(false);
      } catch (err) { setErroPolling(true); }
    }, 3000);
    return () => clearInterval(interval);
  }, [idosos]);

  const idososFiltrados = idosos.filter((idoso) => {
    if (!idoso.ativo) return false;
    const termo = termoPesquisa.toLowerCase();
    return (
      idoso.nome?.toLowerCase().includes(termo) ||
      idoso.dispositivo?.serial?.toLowerCase().includes(termo)
    );
  });

  const stats = useMemo(() => {
    let estaveis = 0, atencao = 0, critico = 0, offline = 0;
    idososFiltrados.forEach(idoso => {
      const serial = idoso.dispositivo?.serial;
      const dados  = lerTelemetria(telemetria, serial);
      if (!estaAoVivo(dados.ultimaAtualizacao)) offline++;
      else if (dados.acelerometro === "QUEDA!") critico++;
      else if (
        (dados.bpm  && (dados.bpm  < 60 || dados.bpm  > 100)) ||
        (dados.temp && (dados.temp >= 37.8 || dados.temp < 35.5))
      ) atencao++;
      else estaveis++;
    });
    return { total: idososFiltrados.length, estaveis, atencao, critico, offline };
  }, [idososFiltrados, telemetria]);

  const handleTestarPulseira = async (idosoNome, serial) => {
    try {
      await api.post(`/api/telemetria/comando-led/${serial}`);
      alert(`Sinal enviado para pulseira de ${idosoNome}!`);
    } catch (err) { alert("Erro de conexão com o hardware."); }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`ATENÇÃO: Deseja inativar o idoso ${nome}?`)) return;
    try { await api.delete(`/idosos/${id}`); fetchIdosos(); }
    catch (error) { alert("Erro ao inativar."); }
  };

  const salvarEdicao = async () => {
    const novosErros = coletarErros({
      nome: validarNome(idosoEditando?.nome),
      cpf:  validarCPF(idosoEditando?.cpf),
    });
    if (Object.keys(novosErros).length > 0) return setErros(novosErros);
    try {
      await api.put(`/idosos/${idosoEditando.id}`, {
        nome:              idosoEditando.nome,
        cpf:               idosoEditando.cpf,
        email:             idosoEditando.email,
        serialDispositivo: idosoEditando.dispositivo?.serial,
      });
      setOpenModal(false);
      fetchIdosos();
    } catch (err) { alert("Erro ao atualizar idoso."); }
  };

  const fecharModal = () => { setOpenModal(false); setErros({}); };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <style>{`
        @keyframes heartbeat {
          0%   { transform: scale(1);    }
          25%  { transform: scale(1.15); }
          50%  { transform: scale(1);    }
          75%  { transform: scale(1.15); }
          100% { transform: scale(1);    }
        }
        .heart-beat-active { animation: heartbeat 1.2s infinite; }
      `}</style>

      {/* ── Cabeçalho ── */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
        <Box>
          <Typography component="h2" variant="h4" sx={{ color: '#1a3d0a', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Central de Monitoramento
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Tempo Real IoT</Typography>
            <Chip
              size="small"
              icon={erroPolling
                ? <WifiOffIcon sx={{ fontSize: '14px !important' }} />
                : <WifiIcon    sx={{ fontSize: '14px !important' }} />}
              label={erroPolling
                ? "Falha na Nuvem"
                : ultimaSync
                  ? `Sync: ${ultimaSync.toLocaleTimeString()}`
                  : "Aguardando..."}
              color={erroPolling ? "error" : "success"}
              sx={{ fontWeight: 600, height: 24, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
        <TextField
          placeholder="Pesquisar idoso ou serial..."
          variant="outlined"
          size="small"
          onChange={(e) => setTermoPesquisa(e.target.value)}
          sx={{ width: { xs: '100%', md: 320 }, bgcolor: '#fff', borderRadius: 2, '& fieldset': { borderRadius: 2 } }}
        />
      </Box>

      {/* ── Painel Analítico ── */}
      <Grid container spacing={2}>
        {[
          { label: "Total Monitorados", value: stats.total,    color: "#1a3d0a", bg: "#e4f0dc", icon: <DirectionsRunIcon /> },
          { label: "Estáveis",          value: stats.estaveis, color: "#2ecc71", bg: "#e8f8f5", icon: <CheckCircleIcon /> },
          { label: "Atenção",           value: stats.atencao,  color: "#f39c12", bg: "#fef5e7", icon: <WarningAmberIcon /> },
          { label: "Quedas",            value: stats.critico,  color: "#e74c3c", bg: "#fdedec", icon: <ReportProblemIcon /> },
        ].map((kpi, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, bgcolor: kpi.bg, border: `1px solid ${kpi.color}30`, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: kpi.color, opacity: 0.8 }}>
                {kpi.icon}
                <Typography variant="caption" fontWeight={700} textTransform="uppercase">{kpi.label}</Typography>
              </Box>
              <Typography variant="h3" fontWeight={800} sx={{ color: kpi.color }}>{kpi.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Grid de Cards das Pulseiras ── */}
      <Grid container spacing={3} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {idososFiltrados.map((idoso) => {
          const serial   = idoso.dispositivo?.serial;
          const dados    = lerTelemetria(telemetria, serial);
          const aoVivo   = estaAoVivo(dados.ultimaAtualizacao);
          const temQueda = dados.acelerometro === "QUEDA!";

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} component="li" key={idoso.id}>
              <Card sx={{
                borderRadius: 4,
                boxShadow: temQueda ? '0 0 0 4px rgba(231,76,60,0.4)' : '0 8px 24px rgba(42,92,20,0.06)',
                border:     temQueda ? '2px solid #e74c3c' : '1px solid rgba(42,92,20,0.1)',
                transition: '0.3s',
                '&:hover':  { transform: 'translateY(-6px)' },
              }}>
                {/* Barra de status no topo */}
                <Box sx={{ height: 4, width: '100%', bgcolor: temQueda ? '#e74c3c' : (aoVivo ? '#4fa825' : '#95a5a6') }} />

                <CardContent sx={{ p: 3 }}>
                  {/* Nome + status online */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#1a3d0a' }}>{idoso.nome}</Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d', fontWeight: 600, bgcolor: '#f4f6f8', px: 1, borderRadius: 1 }}>
                        ID: {serial}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: aoVivo ? '#e8f5e9' : '#f5f5f5', px: 1.2, py: 0.5, borderRadius: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: aoVivo ? '#2ecc71' : '#95a5a6' }} />
                      <Typography variant="caption" fontWeight={700} sx={{ color: aoVivo ? '#27ae60' : '#7f8c8d' }}>
                        {aoVivo ? "ONLINE" : "OFFLINE"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Alerta de queda */}
                  {temQueda && (
                    <Box sx={{ bgcolor: '#fdedec', borderRadius: 2, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningAmberIcon sx={{ color: '#e74c3c' }} />
                      <Typography variant="body2" fontWeight={800} color="#e74c3c">QUEDA DETECTADA</Typography>
                    </Box>
                  )}

                  {/* Sinais vitais */}
                  <Box sx={{ bgcolor: 'rgba(200,221,184,0.15)', p: 2, borderRadius: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <FavoriteIcon
                        className={aoVivo && dados.bpm ? "heart-beat-active" : ""}
                        sx={{ fontSize: 24, color: corBpm(dados.bpm), mr: 1.5 }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Batimentos</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: corBpm(dados.bpm) }}>
                          {dados.bpm ?? '--'} <span style={{ fontSize: 12 }}>BPM</span>
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThermostatIcon sx={{ fontSize: 24, color: corTemp(dados.temp), mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Temperatura</Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: corTemp(dados.temp) }}>
                          {dados.temp ?? '--'} <span style={{ fontSize: 12 }}>°C</span>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Botões de ação — visíveis apenas para GESTOR */}
                  {podeEditar && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1, borderTop: '1px solid rgba(42,92,20,0.08)' }}>
                      <Tooltip title="Editar idoso" arrow>
                        <IconButton
                          size="small"
                          onClick={() => { setIdosoEditando({ ...idoso }); setOpenModal(true); }}
                          sx={{ color: '#2a5c14', bgcolor: 'rgba(42,92,20,0.06)', '&:hover': { bgcolor: 'rgba(42,92,20,0.14)' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Inativar idoso" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(idoso.id, idoso.nome)}
                          sx={{ color: '#e74c3c', bgcolor: 'rgba(231,76,60,0.06)', '&:hover': { bgcolor: 'rgba(231,76,60,0.14)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Modal de Edição ── */}
      <Modal open={openModal} onClose={fecharModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '92%', sm: 480 },
          bgcolor: '#fff', borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          outline: 'none', overflow: 'hidden',
        }}>
          {/* Cabeçalho do modal */}
          <Box sx={{ bgcolor: '#1a3d0a', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EditIcon sx={{ color: '#7ec44f', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', fontSize: '1rem' }}>
                Editar Idoso
              </Typography>
            </Box>
            <IconButton size="small" onClick={fecharModal} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}>
              ✕
            </IconButton>
          </Box>

          {/* Corpo do modal */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Nome completo"
              fullWidth
              size="small"
              value={idosoEditando?.nome ?? ''}
              onChange={(e) => setIdosoEditando((prev) => ({ ...prev, nome: e.target.value }))}
              error={!!erros.nome}
              helperText={erros.nome}
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
            <TextField
              label="CPF"
              fullWidth
              size="small"
              value={idosoEditando?.cpf ?? ''}
              onChange={(e) => setIdosoEditando((prev) => ({ ...prev, cpf: mascararCPF(e.target.value) }))}
              error={!!erros.cpf}
              helperText={erros.cpf}
              inputProps={{ maxLength: 14 }}
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
            <TextField
              label="E-mail"
              fullWidth
              size="small"
              value={idosoEditando?.email ?? ''}
              onChange={(e) => setIdosoEditando((prev) => ({ ...prev, email: e.target.value }))}
              error={!!erros.email}
              helperText={erros.email}
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
            <TextField
              label="Serial do dispositivo"
              fullWidth
              size="small"
              value={idosoEditando?.dispositivo?.serial ?? ''}
              onChange={(e) => setIdosoEditando((prev) => ({ ...prev, dispositivo: { ...prev.dispositivo, serial: e.target.value } }))}
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
          </Box>

          {/* Rodapé do modal */}
          <Divider />
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={fecharModal}
              sx={{ borderColor: 'rgba(0,0,0,0.2)', color: '#555', borderRadius: 2, '&:hover': { borderColor: '#999' } }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={salvarEdicao}
              sx={{ bgcolor: '#2a5c14', borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#1a3d0a' } }}>
              Salvar alterações
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}