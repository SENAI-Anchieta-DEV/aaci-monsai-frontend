import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import {
  Grid, Card, CardContent, Typography, Box, IconButton, Chip, TextField, Divider
} from '@mui/material';
import EditIcon          from '@mui/icons-material/Edit';
import DeleteIcon        from '@mui/icons-material/Delete';
import FavoriteIcon      from '@mui/icons-material/Favorite';
import ThermostatIcon    from '@mui/icons-material/Thermostat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WifiIcon          from '@mui/icons-material/Wifi';
import WifiOffIcon       from '@mui/icons-material/WifiOff';
import api               from '../utils/api';
import { useAuth }       from '../hooks/useAuth';
import { validarNome, validarCPF, validarEmail, coletarErros } from '../utils/validators';
import { mascararCPF }   from '../utils/masks';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';
import { Tooltip }       from '@mui/material';
import { useToast }      from '../components/ToastContext'; // 🌟 Adicionado

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lerTelemetria = (telemetria, pulseiraSerial) => telemetria[pulseiraSerial] || {};
const corMovimento  = (status) => status === "QUEDA!" ? '#d32f2f' : '#2ecc71';

const corBpm = (bpm) => {
  if (!bpm) return '#7f8c8d';
  if (bpm < 60 || bpm > 100) return '#e74c3c';
  return '#2ecc71';
};

const corTemp = (temp) => {
  if (!temp) return '#7f8c8d';
  if (temp >= 37.8) return '#e74c3c';
  if (temp < 35.5)  return '#3498db';
  return '#2ecc71';
};

const corBateria = (nivel) => {
  if (!nivel) return '#7f8c8d';
  if (nivel <= 20) return '#e74c3c';
  if (nivel <= 50) return '#f39c12';
  return '#2ecc71';
};

const estaAoVivo = (ultimaAtualizacao) => {
  if (!ultimaAtualizacao) return false;
  return (Date.now() - ultimaAtualizacao) < 15000;
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Monitoramento() {
  const showToast = useToast(); // 🌟 Instanciando o Toast

  const [idosos, setIdosos]               = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [telemetria, setTelemetria]       = useState({});
  const [openModal, setOpenModal]         = useState(false);
  const [idosoEditando, setIdosoEditando] = useState(null);
  const [erros, setErros]                 = useState({});
  const [ultimaSync, setUltimaSync]       = useState(null);
  const [erroPolling, setErroPolling]     = useState(false);

  // 🌟 Estado para o Dialog de confirmação de exclusão
  const [confirmDialog, setConfirmDialog] = useState({ open: false, idosoId: null, idosoNome: '' });

  const historicoBpm = useRef({});
  const { perfil, usuarioId } = useAuth();
  const podeEditar = perfil === 'GESTOR' || perfil === 'ROLE_GESTOR';

  // ─── Busca de idosos ──────────────────────────────────────────────────────
  const fetchIdosos = async () => {
    try {
      const endpoint = (perfil === 'FAMILIAR' || perfil === 'ROLE_FAMILIAR')
        ? `/usuarios/${usuarioId}/idosos`
        : '/idosos';
      const response = await api.get(endpoint);
      setIdosos(response.data);
    } catch (error) {
      console.error("Erro ao buscar idosos", error);
    }
  };

  useEffect(() => { fetchIdosos(); }, []);

  // ─── Polling de telemetria ────────────────────────────────────────────────
  useEffect(() => {
    if (idosos.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res  = await api.get("/api/telemetria/ultima");
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
              bpm:               dto.sinal_vital?.frequencia_cardiaca_bpm,
              temp:              dto.sinal_vital?.temperatura_c,
              acelerometro:      dto.sinal_vital?.movimento?.queda_detectada ? "QUEDA!" : "Normal",
              aceleracaoX:       dto.sinal_vital?.movimento?.aceleracao?.x,
              aceleracaoY:       dto.sinal_vital?.movimento?.aceleracao?.y,
              aceleracaoZ:       dto.sinal_vital?.movimento?.aceleracao?.z,
              bateria:           dto.status_do_dispositivo?.nivel_bateria,
              statusPulseira:    dto.status_do_dispositivo?.status_pulseira,
              latitude:          dto.localizacao?.latitude,
              longitude:         dto.localizacao?.longitude,
              ultimaAtualizacao: Date.now(),
            };
          });
          return atualizado;
        });

        setUltimaSync(new Date());
        setErroPolling(false);
      } catch (err) {
        console.error("Erro ao buscar telemetria:", err);
        setErroPolling(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [idosos]);

  // ─── Filtragem ────────────────────────────────────────────────────────────
  const idososFiltrados = idosos.filter((idoso) => {
    if (!idoso.ativo) return false;
    const termo = termoPesquisa.toLowerCase();
    return (
      idoso.nome?.toLowerCase().includes(termo) ||
      idoso.dispositivo?.serial?.toLowerCase().includes(termo)
    );
  });

  // ─── Ações ────────────────────────────────────────────────────────────────
  const handleTestarPulseira = async (idosoNome, serial) => {
    try {
      await api.post(`/api/telemetria/comando-led/${serial}`);
      // 🌟 Substituiu alert()
      showToast({
        type: "success",
        title: "Sinal Enviado!",
        message: `Pulseira de ${idosoNome} acionada. O LED deve acender.`,
      });
    } catch (err) {
      // 🌟 Substituiu alert()
      showToast({
        type: "error",
        title: "Pulseira Inacessível",
        message: "Verifique se a pulseira está na mesma rede.",
      });
    }
  };

  // 🌟 Abre o Dialog de confirmação em vez de window.confirm()
  const handleDelete = (id, nome) => {
    if (!podeEditar) {
      showToast({
        type: "error",
        title: "Sem Permissão",
        message: "Você não tem permissão para inativar idosos.",
      });
      return;
    }
    setConfirmDialog({ open: true, idosoId: id, idosoNome: nome });
  };

  // 🌟 Executa a exclusão após confirmação no Dialog
  const confirmarDelete = async () => {
    const { idosoId, idosoNome } = confirmDialog;
    setConfirmDialog({ open: false, idosoId: null, idosoNome: '' });
    try {
      await api.delete(`/idosos/${idosoId}`);
      showToast({
        type: "success",
        title: "Idoso Inativado",
        message: `${idosoNome} foi inativado com sucesso.`,
      });
      fetchIdosos();
    } catch (error) {
      showToast({
        type: "error",
        title: "Erro ao Inativar",
        message: error.response?.data?.message || "Erro interno.",
      });
    }
  };

  const handleEdit = (id) => {
    if (!podeEditar) {
      // 🌟 Substituiu alert()
      showToast({
        type: "error",
        title: "Sem Permissão",
        message: "Você não tem permissão para editar informações dos idosos.",
      });
      return;
    }
    const idosoSelecionado = idosos.find((i) => i.id === id);
    setIdosoEditando({ ...idosoSelecionado });
    setOpenModal(true);
  };

  const validarCampos = () => {
    const novosErros = coletarErros({
      nome:  validarNome(idosoEditando?.nome),
      cpf:   validarCPF(idosoEditando?.cpf),
      email: validarEmail(idosoEditando?.email),
    });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const salvarEdicao = async () => {
    if (!validarCampos()) return;
    try {
      await api.put(`/idosos/${idosoEditando.id}`, {
        nome:              idosoEditando.nome,
        cpf:               idosoEditando.cpf,
        email:             idosoEditando.email,
        serialDispositivo: idosoEditando.dispositivo?.serial,
      });
      // 🌟 Substituiu alert()
      showToast({
        type: "success",
        title: "Dados Atualizados!",
        message: "As informações do idoso foram salvas.",
      });
      fecharModal();
      fetchIdosos();
    } catch (err) {
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro interno.";
      // 🌟 Substituiu alert()
      showToast({
        type: "error",
        title: "Erro ao Atualizar",
        message: msgErro,
      });
    }
  };

  const fecharModal = () => {
    setOpenModal(false);
    setErros({});
  };

  // ─── Sub-componente: Vital Sign ───────────────────────────────────────────
  const VitalItem = ({ icon, label, value, unit, cor }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ mr: 1.5, color: cor, display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography component="dt" variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
          {label}
        </Typography>
        <Typography component="dd" variant="h6" fontWeight="bold" sx={{ color: cor, lineHeight: 1.3 }}>
          {value ?? '--'}{value ? <small style={{ fontSize: 11, fontWeight: 400, marginLeft: 3 }}>{unit}</small> : ''}
        </Typography>
      </Box>
    </Box>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box component="section" sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>

      {/* CABEÇALHO */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 3, mb: 4 }}>
        <Box>
          <Typography component="h2" variant="h4" sx={{ color: '#1a3a16', fontWeight: 'bold' }}>
            Monitoramento em Tempo Real
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Acompanhando {idososFiltrados.length} idosos ativos
            </Typography>
            <Chip
              size="small"
              icon={erroPolling ? <WifiOffIcon sx={{ fontSize: '14px !important' }} /> : <WifiIcon sx={{ fontSize: '14px !important' }} />}
              label={erroPolling ? "Sem conexão" : ultimaSync ? `Sync ${ultimaSync.toLocaleTimeString()}` : "Aguardando..."}
              color={erroPolling ? "error" : "success"}
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 22 }}
            />
          </Box>
        </Box>
        <TextField
          label="Pesquisar por nome ou serial..."
          variant="outlined" size="small"
          onChange={(e) => setTermoPesquisa(e.target.value)}
          sx={{ width: { xs: '100%', sm: 350 }, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </Box>

      {/* GRID DE CARDS */}
      <Grid container spacing={3} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {idososFiltrados.map((idoso) => {
          const serial  = idoso.dispositivo?.serial;
          const dados   = lerTelemetria(telemetria, serial);
          const aoVivo  = estaAoVivo(dados.ultimaAtualizacao);
          const temQueda = dados.acelerometro === "QUEDA!";

          return (
            <Grid key={idoso.id} item xs={12} sm={6} md={4} lg={3} component="li">
              <Card sx={{
                borderRadius: 4,
                boxShadow: temQueda ? '0 0 0 3px #d32f2f, 0 10px 30px rgba(211,47,47,0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
                border: temQueda ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                overflow: 'visible', transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50', lineHeight: 1.2 }}>{idoso.nome}</Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d', fontWeight: 500 }}>Serial: {serial || "NÃO VINCULADO"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip label={idoso.ativo ? "ATIVO" : "INATIVO"} color={idoso.ativo ? "success" : "default"} size="small" sx={{ fontWeight: 'bold', fontSize: '0.65rem' }} />
                      <Chip label={aoVivo ? "● AO VIVO" : "SEM SINAL"} size="small" sx={{ fontWeight: 'bold', fontSize: '0.6rem', bgcolor: aoVivo ? '#e8f5e9' : '#fafafa', color: aoVivo ? '#2e7d32' : '#9e9e9e', border: `1px solid ${aoVivo ? '#a5d6a7' : '#e0e0e0'}` }} />
                    </Box>
                  </Box>

                  {temQueda && (
                    <Box sx={{ bgcolor: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 2, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="error">⚠️ QUEDA DETECTADA!</Typography>
                    </Box>
                  )}

                  <Box component="dl" sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 3, mb: 2, border: '1px solid #f1f2f6' }}>
                    <VitalItem icon={<FavoriteIcon sx={{ fontSize: 26 }} />} label="Frequência Cardíaca" value={dados.bpm} unit="BPM" cor={corBpm(dados.bpm)} />
                    <VitalItem icon={<ThermostatIcon sx={{ fontSize: 26 }} />} label="Temperatura Corporal" value={dados.temp} unit="°C" cor={corTemp(dados.temp)} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DirectionsRunIcon sx={{ mr: 0.5, fontSize: 18, color: corMovimento(dados.acelerometro) }} />
                        <Typography variant="body2" fontWeight="bold" sx={{ color: corMovimento(dados.acelerometro), fontSize: '0.75rem' }}>
                          {dados.acelerometro || "Normal"}
                        </Typography>
                      </Box>
                      {dados.bateria !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BatteryChargingFullIcon sx={{ fontSize: 18, color: corBateria(dados.bateria), mr: 0.3 }} />
                          <Typography variant="caption" sx={{ color: corBateria(dados.bateria), fontWeight: 600 }}>{dados.bateria}%</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Testar LED da Pulseira">
                        <IconButton size="small" sx={{ color: '#f39c12', mr: 0.5 }} onClick={() => handleTestarPulseira(idoso.nome, serial)}>
                          <LightbulbCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" sx={{ color: '#3498db' }} onClick={() => handleEdit(idoso.id)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#e74c3c' }} onClick={() => handleDelete(idoso.id, idoso.nome)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ESTADO VAZIO */}
      {idososFiltrados.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 15, py: 5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 4 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>Nenhum idoso encontrado</Typography>
          <Typography variant="body1" color="text.secondary">
            Não localizamos resultados para: <strong>"{termoPesquisa}"</strong>
          </Typography>
        </Box>
      )}

      {/* 🌟 DIALOG DE CONFIRMAÇÃO (substituiu window.confirm) */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, idosoId: null, idosoNome: '' })}>
        <DialogTitle sx={{ color: '#1a3a16', fontWeight: 'bold' }}>Confirmar Inativação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja inativar o idoso <strong>{confirmDialog.idosoNome}</strong>? Essa ação pode ser revertida pelo gestor.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmDialog({ open: false, idosoId: null, idosoNome: '' })} color="inherit" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={confirmarDelete} variant="contained" sx={{ bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' } }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE EDIÇÃO */}
      <Modal open={openModal} onClose={fecharModal} aria-label="Editar dados do idoso">
        <Box component="section" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 450 }, bgcolor: 'white', borderRadius: 4, p: 4, boxShadow: 24 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1a3a16' }}>
            Editar Dados do Idoso
          </Typography>
          {idosoEditando && (
            <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Nome Completo" variant="outlined"
                value={idosoEditando.nome || ''} error={!!erros.nome} helperText={erros.nome}
                onChange={(e) => setIdosoEditando({ ...idosoEditando, nome: e.target.value })} />
              <TextField fullWidth required label="CPF" variant="outlined"
                value={idosoEditando.cpf || ''} error={!!erros.cpf} helperText={erros.cpf || "000.000.000-00"}
                inputProps={{ maxLength: 14 }}
                onChange={(e) => { setIdosoEditando({ ...idosoEditando, cpf: mascararCPF(e.target.value) }); if (erros.cpf) setErros((prev) => ({ ...prev, cpf: null })); }} />
              <TextField fullWidth label="Email do Familiar" variant="outlined"
                value={idosoEditando.email || ''} error={!!erros.email} helperText={erros.email}
                onChange={(e) => setIdosoEditando({ ...idosoEditando, email: e.target.value })} />
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={fecharModal} variant="outlined" color="inherit">Cancelar</Button>
                <Button variant="contained" onClick={salvarEdicao} sx={{ bgcolor: '#1a3a16', fontWeight: 'bold', '&:hover': { bgcolor: '#2e5a26' } }}>
                  Confirmar Alterações
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
}