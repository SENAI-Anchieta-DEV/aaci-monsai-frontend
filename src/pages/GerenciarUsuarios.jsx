import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Alert, CircularProgress, Dialog, DialogContent,
  DialogActions, Button, TextField, Chip, useMediaQuery, useTheme,
  Stack, Card, CardContent, Divider
} from '@mui/material';
import DeleteIcon  from '@mui/icons-material/Delete';
import VpnKeyIcon  from '@mui/icons-material/VpnKey';
import GroupIcon   from '@mui/icons-material/Group';
import LinkIcon    from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import api         from '../utils/api';
import { useToast } from '../components/ToastContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const resolverIdUsuario = (usuario) => usuario.id || usuario.usuarioId;
const ehFamiliar = (tipo) => tipo === 'FAMILIAR' || tipo === 'ROLE_FAMILIAR';

// ─── Badge de cargo ───────────────────────────────────────────────────────────
const CargoBadge = ({ tipo }) => (
  <Chip
    label={tipo}
    size="small"
    sx={{ bgcolor: '#AED696', color: '#1a3d0a', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
  />
);

// ─── Card mobile de usuário ───────────────────────────────────────────────────
const UsuarioCard = ({ usuario, onAlterarSenha, onInativar, onVincular, onDesvincular, idLogado }) => {
  const ehVoce = resolverIdUsuario(usuario) === idLogado;

  return (
    <Card component="article" variant="outlined" sx={{
      mb: 2, borderRadius: 4,
      border: '1px solid rgba(42,92,20,0.12)',
      boxShadow: '0 4px 16px rgba(42,92,20,0.05)',
      transition: '0.25s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(42,92,20,0.10)' },
    }}>
      {/* Barra de topo igual ao card de monitoramento */}
      <Box sx={{ height: 4, bgcolor: '#4fa825', borderRadius: '4px 4px 0 0' }} />
      <CardContent sx={{ p: '16px !important' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Typography fontWeight={800} sx={{ color: '#1a3d0a' }}>{usuario.nome}</Typography>
              {ehVoce && (
                <Chip label="Você" size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#2d5a27', fontSize: '0.68rem', height: 18, fontWeight: 700 }} />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>{usuario.email}</Typography>
            <CargoBadge tipo={usuario.tipo || usuario.tipoUsuario} />
          </Box>

          <Stack direction="row" alignItems="center" gap={0.5}>
            <Tooltip title="Alterar Senha" arrow>
              <IconButton onClick={() => onAlterarSenha(usuario)} size="small"
                sx={{ color: '#2a5c14', bgcolor: 'rgba(42,92,20,0.06)', '&:hover': { bgcolor: 'rgba(42,92,20,0.14)' } }}>
                <VpnKeyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={ehVoce ? "Você não pode remover a si mesmo" : "Remover Acesso"} arrow>
              <span>
                <IconButton
                  onClick={() => onInativar(resolverIdUsuario(usuario), usuario.nome)}
                  disabled={ehVoce} size="small"
                  sx={{ color: ehVoce ? '#ccc' : '#e74c3c', bgcolor: ehVoce ? 'transparent' : 'rgba(231,76,60,0.06)', '&:hover': { bgcolor: 'rgba(231,76,60,0.14)' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {ehFamiliar(usuario.tipo) && (
          <>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(42,92,20,0.08)' }} />
            <Stack direction="row" gap={1}>
              <Button size="small" variant="outlined" fullWidth startIcon={<LinkIcon />}
                onClick={() => onVincular(usuario)}
                sx={{ borderColor: 'rgba(42,92,20,0.3)', color: '#2a5c14', borderRadius: 2, fontWeight: 700, '&:hover': { borderColor: '#2a5c14', bgcolor: 'rgba(42,92,20,0.04)' } }}>
                Vincular
              </Button>
              <Button size="small" variant="outlined" fullWidth startIcon={<LinkOffIcon />}
                onClick={() => onDesvincular(usuario)}
                sx={{ borderColor: 'rgba(231,76,60,0.3)', color: '#e74c3c', borderRadius: 2, fontWeight: 700, '&:hover': { borderColor: '#e74c3c', bgcolor: 'rgba(231,76,60,0.04)' } }}>
                Desvincular
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function GerenciarUsuarios({ asiloId }) {
  const [usuarios,           setUsuarios]           = useState([]);
  const [listaIdosos,        setListaIdosos]        = useState([]);
  const [status,             setStatus]             = useState({ loading: true, error: null, success: null });
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [idosoSelecionado,   setIdosoSelecionado]   = useState('');
  const [novaSenha,          setNovaSenha]          = useState('');
  const [modalSenhaAberto,      setModalSenhaAberto]      = useState(false);
  const [modalVinculoAberto,    setModalVinculoAberto]    = useState(false);
  const [modalDesvinculoAberto, setModalDesvinculoAberto] = useState(false);

  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const showToast = useToast();

  const idLogado = Number(localStorage.getItem('usuarioId')) || null;

  // ─── Busca de dados ──────────────────────────────────────────────────────
  const carregarUsuarios = useCallback(async () => {
    try {
      setStatus({ loading: true, error: null, success: null });
      const response = await api.get('/usuarios');
      const usuariosDoAsilo = response.data.filter(
        (u) => u.asilo?.id === Number(asiloId) && u.ativo === true
      );
      setUsuarios(usuariosDoAsilo);
      setStatus({ loading: false, error: null, success: null });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: "Erro ao carregar a lista de usuários.", success: null });
    }
  }, [asiloId]);

  const carregarIdosos = async () => {
    try {
      const res = await api.get('/idosos');
      setListaIdosos(res.data.filter(i => i.ativo));
    } catch (err) { console.error("Erro ao carregar idosos", err); }
  };

  useEffect(() => { carregarUsuarios(); carregarIdosos(); }, [carregarUsuarios]);

  // ─── Ações ───────────────────────────────────────────────────────────────
  const handleInativar = async (id, nome) => {
    if (id === idLogado) {
      showToast({ type: "error", title: "Ação não permitida", message: "Você não pode remover o seu próprio acesso." });
      return;
    }
    if (!window.confirm(`Tem certeza que deseja remover o acesso de ${nome}?`)) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((u) => resolverIdUsuario(u) !== id));
      showToast({ type: "success", title: "Acesso removido", message: `${nome} foi inativado com sucesso.` });
    } catch (err) {
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao inativar usuário.";
      showToast({ type: "error", title: "Erro", message: msgErro });
    }
  };

  const abrirModalSenha = (usuario) => { setUsuarioSelecionado(usuario); setNovaSenha(''); setModalSenhaAberto(true); };

  const handleSalvarSenha = async () => {
    if (novaSenha.length < 6) {
      showToast({ type: "error", title: "Senha fraca", message: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }
    try {
      // 🚀 Adicione um log aqui para você ver exatamente o que está saindo do navegador
      console.log("Enviando JSON:", { senha: novaSenha });

      await api.patch(`/usuarios/${resolverIdUsuario(usuarioSelecionado)}/senha`, {
        senha: novaSenha
      });
      
      setModalSenhaAberto(false);
      showToast({ type: "success", title: "Senha atualizada!", message: "Senha alterada com sucesso." });
    } catch (err) {
      // Isso vai te mostrar a mensagem real que o backend devolveu
      console.error("Erro completo:", err.response?.data);
      const msgErro = err.response?.data?.message || "Erro ao atualizar a senha.";
      showToast({ type: "error", title: "Erro", message: msgErro });
    }
  };

  const handleVincular = async () => {
    try {
      await api.post(`/usuarios/${resolverIdUsuario(usuarioSelecionado)}/idosos/${idosoSelecionado}`, {});
      showToast({ type: "success", title: "Vinculado!", message: "Idoso vinculado com sucesso." });
      setModalVinculoAberto(false);
      setIdosoSelecionado('');
      carregarUsuarios();
    } catch (err) {
      showToast({ type: "error", title: "Erro ao vincular", message: err.response?.data?.detail || "Erro desconhecido" });
    }
  };

  const handleDesvincular = async (idUsuario, idIdoso) => {
    if (!window.confirm("Deseja remover o vínculo deste idoso com este usuário?")) return;
    try {
      await api.delete(`/usuarios/${idUsuario}/idosos/${idIdoso}`);
      showToast({ type: "success", title: "Vínculo removido!", message: "O vínculo foi desfeito com sucesso." });
      setModalDesvinculoAberto(false);
      setIdosoSelecionado('');
      carregarUsuarios();
    } catch (err) {
      showToast({ type: "error", title: "Erro ao desvincular", message: err.response?.data?.message || "Erro interno" });
    }
  };

  const abrirModalVinculo    = (u) => { setUsuarioSelecionado(u); setIdosoSelecionado(''); setModalVinculoAberto(true); };
  const abrirModalDesvinculo = (u) => { setUsuarioSelecionado(u); setIdosoSelecionado(''); setModalDesvinculoAberto(true); };

  const idososJaVinculados = usuarioSelecionado?.idosos || [];

  // ─── Estilos compartilhados para os modais ────────────────────────────────
  // const modalHeaderSx = (cor = '#1a3d0a') => ({
  //   bgcolor: cor, color: '#fff', py: 2, px: 3,
  //   '& .MuiDialogTitle-root': { p: 0 },
  // });

  const modalBtnConfirmarSx = (cor = '#2a5c14') => ({
    bgcolor: cor, borderRadius: 2, fontWeight: 700,
    boxShadow: 'none',
    '&:hover': { bgcolor: cor === '#2a5c14' ? '#1a3d0a' : '#c0392b', boxShadow: 'none' },
  });

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography component="h2" variant="h4" sx={{ color: '#1a3d0a', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Gerenciar Colaboradores
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Controle de Acesso</Typography>
            <Chip
              size="small"
              icon={<GroupIcon sx={{ fontSize: '14px !important' }} />}
              label={`${usuarios.length} ativo${usuarios.length !== 1 ? 's' : ''}`}
              color="success"
              sx={{ fontWeight: 600, height: 24, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
      </Box>

      {status.error && <Alert severity="error" sx={{ borderRadius: 3 }}>{status.error}</Alert>}

      {status.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress sx={{ color: '#2a5c14' }} />
        </Box>
      ) : isMobile ? (
        /* ── Vista Mobile ─────────────────────────────────────────────── */
        <Box>
          {usuarios.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              Nenhum colaborador ativo encontrado.
            </Typography>
          ) : (
            usuarios.map((usuario) => (
              <UsuarioCard
                key={resolverIdUsuario(usuario)}
                usuario={usuario}
                idLogado={idLogado}
                onAlterarSenha={abrirModalSenha}
                onInativar={handleInativar}
                onVincular={abrirModalVinculo}
                onDesvincular={abrirModalDesvinculo}
              />
            ))
          )}
        </Box>
      ) : (
        /* ── Vista Desktop ────────────────────────────────────────────── */
        <Paper elevation={0} sx={{
          borderRadius: 4,
          border: '1px solid rgba(42,92,20,0.1)',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(42,92,20,0.06)',
        }}>
          <TableContainer>
            <Table aria-label="Lista de colaboradores">
              <TableHead>
                <TableRow sx={{ bgcolor: '#1a3d0a' }}>
                  {['Nome', 'E-mail', 'Cargo', 'Ações'].map((col, i) => (
                    <TableCell key={col} align={i === 3 ? 'center' : 'left'}
                      sx={{ fontWeight: 800, color: '#fff', fontSize: '0.82rem', letterSpacing: '0.5px', py: 2 }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Nenhum colaborador ativo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => {
                    const ehVoce = resolverIdUsuario(usuario) === idLogado;
                    return (
                      <TableRow key={resolverIdUsuario(usuario)} hover
                        sx={{ '&:hover': { bgcolor: 'rgba(42,92,20,0.03)' }, transition: '0.15s' }}>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={700} sx={{ color: '#1a3d0a', fontSize: '0.9rem' }}>
                              {usuario.nome}
                            </Typography>
                            {ehVoce && (
                              <Chip label="Você" size="small"
                                sx={{ bgcolor: '#e8f5e9', color: '#2d5a27', fontSize: '0.68rem', height: 18, fontWeight: 700 }} />
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#7f8c8d' }}>{usuario.email}</Typography>
                        </TableCell>

                        <TableCell>
                          <CargoBadge tipo={usuario.tipo || usuario.tipoUsuario} />
                        </TableCell>

                        <TableCell align="center">
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                            <Tooltip title="Alterar Senha" arrow>
                              <IconButton onClick={() => abrirModalSenha(usuario)} size="small"
                                sx={{ color: '#2a5c14', bgcolor: 'rgba(42,92,20,0.06)', '&:hover': { bgcolor: 'rgba(42,92,20,0.14)' } }}>
                                <VpnKeyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {ehFamiliar(usuario.tipo) && (
                              <>
                                <Tooltip title="Vincular idoso" arrow>
                                  <IconButton onClick={() => abrirModalVinculo(usuario)} size="small"
                                    sx={{ color: '#2a5c14', bgcolor: 'rgba(42,92,20,0.06)', '&:hover': { bgcolor: 'rgba(42,92,20,0.14)' } }}>
                                    <LinkIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Desvincular idoso" arrow>
                                  <IconButton onClick={() => abrirModalDesvinculo(usuario)} size="small"
                                    sx={{ color: '#e67e22', bgcolor: 'rgba(230,126,34,0.06)', '&:hover': { bgcolor: 'rgba(230,126,34,0.14)' } }}>
                                    <LinkOffIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}

                            <Tooltip title={ehVoce ? "Você não pode remover a si mesmo" : "Remover Acesso"} arrow>
                              <span>
                                <IconButton
                                  onClick={() => handleInativar(resolverIdUsuario(usuario), usuario.nome)}
                                  disabled={ehVoce} size="small"
                                  sx={{ color: ehVoce ? '#ccc' : '#e74c3c', bgcolor: ehVoce ? 'transparent' : 'rgba(231,76,60,0.06)', '&:hover': { bgcolor: 'rgba(231,76,60,0.14)' } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ── Modal: Alterar Senha ────────────────────────────────────────── */}
      <Dialog open={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#1a3d0a', px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <VpnKeyIcon sx={{ color: '#7ec44f', fontSize: 20 }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', fontSize: '1rem' }}>
            Redefinir Senha
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2.5, color: '#7f8c8d' }}>
            Nova senha para <strong style={{ color: '#1a3d0a' }}>{usuarioSelecionado?.nome}</strong>.
          </Typography>
          <TextField
            autoFocus fullWidth size="small" label="Nova Senha" type="password"
            value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSalvarSenha()}
            sx={{ '& fieldset': { borderRadius: 2 } }}
          />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setModalSenhaAberto(false)}
            sx={{ borderRadius: 2, color: '#555', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleSalvarSenha} variant="contained" sx={modalBtnConfirmarSx()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: Vincular Idoso ───────────────────────────────────────── */}
      <Dialog open={modalVinculoAberto} onClose={() => setModalVinculoAberto(false)} fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#1a3d0a', px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LinkIcon sx={{ color: '#7ec44f', fontSize: 20 }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', fontSize: '1rem' }}>
            Vincular Idoso
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2.5, color: '#7f8c8d' }}>
            Selecione um idoso para vincular a <strong style={{ color: '#1a3d0a' }}>{usuarioSelecionado?.nome}</strong>.
          </Typography>
          <TextField select fullWidth size="small" label="Selecione o Idoso"
            value={idosoSelecionado} onChange={(e) => setIdosoSelecionado(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ '& fieldset': { borderRadius: 2 } }}>
            <option value=""></option>
            {listaIdosos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </TextField>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setModalVinculoAberto(false)}
            sx={{ borderRadius: 2, color: '#555', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={handleVincular} variant="contained" disabled={!idosoSelecionado}
            sx={modalBtnConfirmarSx()}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: Desvincular Idoso ────────────────────────────────────── */}
      <Dialog open={modalDesvinculoAberto} onClose={() => setModalDesvinculoAberto(false)} fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#c0392b', px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LinkOffIcon sx={{ color: '#fff', fontSize: 20 }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', fontSize: '1rem' }}>
            Remover Vínculo
          </Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2.5, color: '#7f8c8d' }}>
            Selecione o idoso a desvincular de <strong style={{ color: '#1a3d0a' }}>{usuarioSelecionado?.nome}</strong>.
          </Typography>
          <TextField select fullWidth size="small" label="Idoso Vinculado"
            value={idosoSelecionado} onChange={(e) => setIdosoSelecionado(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ '& fieldset': { borderRadius: 2 } }}>
            <option value=""></option>
            {idososJaVinculados.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </TextField>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setModalDesvinculoAberto(false)}
            sx={{ borderRadius: 2, color: '#555', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" disabled={!idosoSelecionado}
            onClick={() => handleDesvincular(resolverIdUsuario(usuarioSelecionado), idosoSelecionado)}
            sx={{ borderRadius: 2, fontWeight: 700, boxShadow: 'none' }}>
            Desvincular
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}