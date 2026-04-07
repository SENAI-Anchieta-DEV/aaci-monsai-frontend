import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from "@mui/material";
import { 
  Grid, Card, CardContent, Typography, Box, IconButton, Chip, TextField, Divider
} from '@mui/material';
import EditIcon          from '@mui/icons-material/Edit';
import DeleteIcon        from '@mui/icons-material/Delete';
import FavoriteIcon      from '@mui/icons-material/Favorite';
import ThermostatIcon    from '@mui/icons-material/Thermostat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import api               from '../utils/api';
import { useAuth }       from '../hooks/useAuth';
import { validarNome, validarCPF, validarEmail, coletarErros } from '../utils/validators';
import { mascararCPF }   from '../utils/masks';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Lê os dados de telemetria usando o serial do dispositivo como chave
const lerTelemetria = (telemetria, dispositivoId) => telemetria[dispositivoId] || {};

// Determina a cor do indicador de movimento
const corMovimento = (status) => status === "QUEDA!" ? '#d32f2f' : '#2ecc71';

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Monitoramento() {
  const [idosos, setIdosos]               = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [telemetria, setTelemetria]       = useState({});
  const [openModal, setOpenModal]         = useState(false);
  const [idosoEditando, setIdosoEditando] = useState(null);
  const [erros, setErros]                 = useState({});

  const { perfil, usuarioId } = useAuth();

  // Apenas Gestores podem editar e excluir idosos
  const podeEditar = perfil === 'GESTOR' || perfil === 'ROLE_GESTOR';

  // ─── Busca de idosos (dinâmica por perfil) ───────────────────────────────
  const fetchIdosos = async () => {
    try {
      // Familiares têm uma rota exclusiva que filtra apenas seus idosos vinculados
      const endpoint = (perfil === 'FAMILIAR' || perfil === 'ROLE_FAMILIAR')
        ? `/usuarios/${usuarioId}/idosos`
        : '/idosos';

      const response = await api.get(endpoint);
      setIdosos(response.data);

    } catch (error) {
      console.error("Erro ao buscar idosos", error);
    }
  };

  useEffect(() => {
    fetchIdosos();
  }, []);

  // ─── Polling de telemetria a cada 3 segundos ─────────────────────────────
  useEffect(() => {
    if (idosos.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get("/api/telemetria/ultima");
        const dto = res.data;

        if (dto) {
          setTelemetria((prev) => ({
            ...prev,
            [dto.pulseira_id]: {
              bpm:          dto.sinal_vital.frequencia_cardiaca_bpm,
              temp:         dto.sinal_vital.temperatura_c,
              acelerometro: dto.sinal_vital.movimento.queda_detectada ? "QUEDA!" : "Normal",
              bateria:      dto.status_do_dispositivo.nivel_bateria,
            },
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar telemetria:", err);
      }
    }, 3000);

    // Limpa o intervalo quando o componente for desmontado para evitar memory leak
    return () => clearInterval(interval);
  }, [idosos]);

  // ─── Filtragem ────────────────────────────────────────────────────────────

  // Filtra os idosos ativos aplicando a regra de texto da barra de pesquisa
  const idososFiltrados = idosos.filter((idoso) => {
    if (!idoso.ativo) return false;

    // A regra de vínculo é resolvida pelo backend na rota correta
    const termo = termoPesquisa.toLowerCase();
    return (
      idoso.nome?.toLowerCase().includes(termo) ||
      idoso.dispositivo?.serial?.toLowerCase().includes(termo)
    );
  });

  // ─── Ações ────────────────────────────────────────────────────────────────

  const handleDelete = async (id, nome) => {
    if (!podeEditar) {
      alert("Erro: você não tem permissão para inativar idosos.");
      return;
    }

    if (!window.confirm(`ATENÇÃO: Deseja inativar o idoso ${nome}?`)) return;

    try {
      await api.delete(`/idosos/${id}`);
      alert("Idoso inativado com sucesso!");
      fetchIdosos();
    } catch (error) {
      alert("Erro ao inativar: " + (error.response?.data?.message || "Erro interno."));
    }
  };

  // Prepara os dados do idoso selecionado para o modal de edição
  const handleEdit = (id) => {
    if (!podeEditar) {
      alert("Erro: você não tem permissão para editar informações dos idosos.");
      return;
    }
    // Localiza o idoso específico diretamente na lista já carregada
    const idosoSelecionado = idosos.find((i) => i.id === id);
    setIdosoEditando({ ...idosoSelecionado });
    setOpenModal(true);
  };

  // Valida os campos do modal antes de salvar
  const validarCampos = () => {
    const novosErros = coletarErros({
      nome:  validarNome(idosoEditando?.nome),
      cpf:   validarCPF(idosoEditando?.cpf),
      email: validarEmail(idosoEditando?.email),
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Submete as atualizações do idoso para a API
  const salvarEdicao = async () => {
    if (!validarCampos()) return;

    try {
      await api.put(`/idosos/${idosoEditando.id}`, {
        nome:             idosoEditando.nome,
        cpf:              idosoEditando.cpf,
        email:            idosoEditando.email,
        serialDispositivo: idosoEditando.dispositivo?.serial, // Mantém o vínculo atual
      });

      alert("Dados atualizados!");
      fecharModal();
      fetchIdosos();

    } catch (err) {
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro interno.";
      alert("Erro ao atualizar idoso: " + msgErro);
    }
  };

  // Limpa erros ao fechar o modal
  const fecharModal = () => {
    setOpenModal(false);
    setErros({});
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box component="section" sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>

      {/* CABEÇALHO */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 3, mb: 5,
        }}
      >
        <Box>
          <Typography component="h2" variant="h4" sx={{ color: '#1a3a16', fontWeight: 'bold' }}>
            Monitoramento em Tempo Real
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhando {idososFiltrados.length} idosos ativos no sistema
          </Typography>
        </Box>

        <TextField
          label="Pesquisar por nome ou serial..."
          variant="outlined" size="small"
          onChange={(e) => setTermoPesquisa(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 350 },
            bgcolor: 'white', borderRadius: 2,
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
        />
      </Box>

      {/* GRID DE CARDS */}
      <Grid container spacing={3} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {idososFiltrados.map((idoso) => {
          const dados = lerTelemetria(telemetria, idoso.dispositivo?.id);

          return (
            <Grid key={idoso.id} item xs={12} sm={6} md={4} lg={3} component="li">
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  border: '1px solid #e0e0e0',
                  overflow: 'visible',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>

                  {/* Cabeçalho do Card */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50', lineHeight: 1.2 }}>
                        {idoso.nome}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                        RFID: {idoso.dispositivo?.serial || "NÃO VINCULADO"}
                      </Typography>
                    </Box>
                    <Chip
                      label={idoso.ativo ? "ATIVO" : "INATIVO"}
                      color={idoso.ativo ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                    />
                  </Box>

                  {/* Bloco de Sinais Vitais */}
                  <Box
                    component="dl"
                    sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 3, mb: 2, border: '1px solid #f1f2f6' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <FavoriteIcon sx={{ color: '#d32f2f', mr: 1.5, fontSize: 28 }} aria-hidden="true" />
                      <Box>
                        <Typography component="dt" variant="caption" display="block" color="text.secondary">
                          Frequência Cardíaca
                        </Typography>
                        <Typography component="dd" variant="h6" fontWeight="bold">
                          {dados.bpm || '--'} <small style={{ fontSize: 12 }}>BPM</small>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThermostatIcon sx={{ color: '#ef6c00', mr: 1.5, fontSize: 28 }} aria-hidden="true" />
                      <Box>
                        <Typography component="dt" variant="caption" display="block" color="text.secondary">
                          Temperatura Corporal
                        </Typography>
                        <Typography component="dd" variant="h6" fontWeight="bold">
                          {dados.temp || '--'} <small style={{ fontSize: 12 }}>°C</small>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Status de Movimento e Ações */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsRunIcon
                        sx={{ mr: 0.5, fontSize: 20, color: corMovimento(dados.acelerometro) }}
                        aria-hidden="true"
                      />
                      <Typography
                        variant="body2" fontWeight="bold"
                        sx={{ color: corMovimento(dados.acelerometro) }}
                      >
                        {dados.acelerometro || "Normal"}
                      </Typography>
                    </Box>

                    <Box>
                      <IconButton
                        size="small" sx={{ color: '#3498db' }}
                        onClick={() => handleEdit(idoso.id)}
                        aria-label={`Editar ${idoso.nome}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small" sx={{ color: '#e74c3c' }}
                        onClick={() => handleDelete(idoso.id, idoso.nome)}
                        aria-label={`Inativar ${idoso.nome}`}
                      >
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
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Nenhum idoso encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Não localizamos resultados para: <strong>"{termoPesquisa}"</strong>
          </Typography>
        </Box>
      )}

      {/* MODAL DE EDIÇÃO */}
      <Modal open={openModal} onClose={fecharModal} aria-label="Editar dados do idoso">
        <Box
          component="section"
          sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 450 },
            bgcolor: 'white', borderRadius: 4, p: 4, boxShadow: 24,
          }}
        >
          <Typography component="h2" variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1a3a16' }}>
            Editar Dados do Idoso
          </Typography>

          {idosoEditando && (
            <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth label="Nome Completo" variant="outlined"
                value={idosoEditando.nome || ''}
                error={!!erros.nome} helperText={erros.nome}
                onChange={(e) => setIdosoEditando({ ...idosoEditando, nome: e.target.value })}
              />
              <TextField
                fullWidth required label="CPF" variant="outlined"
                value={idosoEditando.cpf || ''}
                error={!!erros.cpf} helperText={erros.cpf || "000.000.000-00"}
                inputProps={{ maxLength: 14 }}
                onChange={(e) => {
                  setIdosoEditando({ ...idosoEditando, cpf: mascararCPF(e.target.value) });
                  // Limpa erro ao digitar
                  if (erros.cpf) setErros((prev) => ({ ...prev, cpf: null }));
                }}
              />
              <TextField
                fullWidth label="Email do Familiar" variant="outlined"
                value={idosoEditando.email || ''}
                error={!!erros.email} helperText={erros.email}
                onChange={(e) => setIdosoEditando({ ...idosoEditando, email: e.target.value })}
              />

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={fecharModal} variant="outlined" color="inherit">
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={salvarEdicao}
                  sx={{ bgcolor: '#1a3a16', fontWeight: 'bold', '&:hover': { bgcolor: '#2e5a26' } }}
                >
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