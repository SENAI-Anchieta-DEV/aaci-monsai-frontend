import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, 
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Chip, useMediaQuery, useTheme, 
  Stack, Card, CardContent, Divider
} from '@mui/material';
import DeleteIcon     from '@mui/icons-material/Delete';
import VpnKeyIcon     from '@mui/icons-material/VpnKey';
import api            from '../utils/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Normaliza o ID do usuário, pois o DTO pode retornar 'id' ou 'usuarioId'
const resolverIdUsuario = (usuario) => usuario.id || usuario.usuarioId;

// Verifica se o tipo de usuário é FAMILIAR (com ou sem prefixo ROLE_)
const ehFamiliar = (tipo) => tipo === 'FAMILIAR' || tipo === 'ROLE_FAMILIAR';

// ─── Sub-componente: Card mobile de usuário ───────────────────────────────────
const UsuarioCard = ({ usuario, onAlterarSenha, onInativar, onVincular, onDesvincular }) => (
  <Card component="article" variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
    <CardContent sx={{ pb: '12px !important' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography fontWeight="bold" color="#1a3d0a">{usuario.nome}</Typography>
          <Typography variant="body2" color="text.secondary">{usuario.email}</Typography>
          <Chip
            label={usuario.tipo || usuario.tipoUsuario}
            size="small"
            sx={{ mt: 1, bgcolor: '#AED696', color: '#1a3d0a', fontWeight: 'bold', fontSize: '0.75rem' }}
          />
        </Box>
        <Stack direction="row" alignItems="center">
          <Tooltip title="Alterar Senha">
            <IconButton onClick={() => onAlterarSenha(usuario)} sx={{ color: '#2d5a27' }} aria-label="Alterar senha">
              <VpnKeyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover Acesso">
            <IconButton
              onClick={() => onInativar(resolverIdUsuario(usuario), usuario.nome)}
              sx={{ color: '#d32f2f' }}
              aria-label="Remover acesso"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {ehFamiliar(usuario.tipo) && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" gap={1}>
            <Button size="small" variant="outlined" fullWidth onClick={() => onVincular(usuario)}>
              Vincular
            </Button>
            <Button size="small" variant="outlined" color="error" fullWidth onClick={() => onDesvincular(usuario)}>
              Desvincular
            </Button>
          </Stack>
        </>
      )}
    </CardContent>
  </Card>
);

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function GerenciarUsuarios({ asiloId }) {
  const [usuarios, setUsuarios]               = useState([]);
  const [listaIdosos, setListaIdosos]         = useState([]);
  const [status, setStatus]                   = useState({ loading: true, error: null, success: null });
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [idosoSelecionado, setIdosoSelecionado]     = useState('');
  const [novaSenha, setNovaSenha]             = useState('');
  const [modalSenhaAberto, setModalSenhaAberto]       = useState(false);
  const [modalVinculoAberto, setModalVinculoAberto]   = useState(false);
  const [modalDesvinculoAberto, setModalDesvinculoAberto] = useState(false);

  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ─── Busca de dados ───────────────────────────────────────────────────────

  const carregarUsuarios = useCallback(async () => {
    try {
      setStatus({ loading: true, error: null, success: null });
      const response = await api.get('/usuarios');

      // Filtra para manter apenas usuários ativos que pertencem ao asilo do gestor logado
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

  // Carrega a lista de idosos do asilo — utilizada nos modais de vínculo de familiares
  const carregarIdosos = async () => {
    try {
      const res = await api.get('/idosos');
      setListaIdosos(res.data);
    } catch (err) {
      console.error("Erro ao carregar idosos", err);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarIdosos();
  }, [carregarUsuarios]);

  // ─── Ações ────────────────────────────────────────────────────────────────

  // Processa a inativação lógica de um usuário no sistema
  const handleInativar = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja remover o acesso de ${nome}?`)) return;

    try {
      await api.delete(`/usuarios/${id}`);
      setStatus({ loading: false, error: null, success: `Usuário ${nome} inativado com sucesso!` });

      // Remove o usuário do estado local para evitar um novo fetch na API
      setUsuarios((prev) => prev.filter((u) => resolverIdUsuario(u) !== id));

    } catch (err) {
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao inativar usuário.";
      setStatus({ loading: false, error: msgErro, success: null });
    }
  };

  // Prepara o estado para abrir o modal com o usuário selecionado
  const abrirModalSenha = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNovaSenha('');
    setModalSenhaAberto(true);
  };

  // Valida e envia a nova senha para o servidor
  const handleSalvarSenha = async () => {
    if (novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const idAlvo = resolverIdUsuario(usuarioSelecionado);

    try {
      // Realiza a atualização parcial (PATCH) com a nova credencial
      await api.patch(`/usuarios/${idAlvo}/senha`, { novaSenha });
      setModalSenhaAberto(false);
      setStatus({ loading: false, error: null, success: "Senha atualizada com sucesso!" });

    } catch (err) {
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro interno";
      alert("Erro ao atualizar a senha: " + msgErro);
    }
  };

  // Vincula um idoso a um familiar (POST /{idUsuario}/idosos/{idIdoso})
  const handleVincular = async () => {
    const idUsuario = resolverIdUsuario(usuarioSelecionado);

    try {
      await api.post(`/usuarios/${idUsuario}/idosos/${idosoSelecionado}`, {});
      alert("Idoso vinculado com sucesso!");
      setModalVinculoAberto(false);
      carregarUsuarios();

    } catch (err) {
      alert("Erro ao vincular: " + (err.response?.data?.detail || "Erro desconhecido"));
    }
  };

  const handleDesvincular = async (idUsuario, idIdoso) => {
    if (!window.confirm("Deseja remover o vínculo deste idoso com este usuário?")) return;

    try {
      await api.delete(`/usuarios/${idUsuario}/idosos/${idIdoso}`);
      alert("Vínculo removido com sucesso!");
      carregarUsuarios();

    } catch (err) {
      alert("Erro ao desvincular: " + (err.response?.data?.message || "Erro interno"));
    }
  };

  // ─── Helpers de abertura de modais ───────────────────────────────────────
  const abrirModalVinculo = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalVinculoAberto(true);
  };

  const abrirModalDesvinculo = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalDesvinculoAberto(true);
  };

  const idososJaVinculados = usuarioSelecionado?.idosos || [];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box component="section" sx={{ maxWidth: 1000, mx: 'auto', mt: 2, px: { xs: 1, sm: 2 } }}>
      <Typography component="h2" variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
        Gerenciar Colaboradores
      </Typography>

      {status.success && <Alert severity="success" sx={{ mb: 2 }}>{status.success}</Alert>}
      {status.error   && <Alert severity="error"   sx={{ mb: 2 }}>{status.error}</Alert>}

      {status.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress sx={{ color: '#2d5a27' }} />
        </Box>
      ) : isMobile ? (
        /* ── Layout mobile: cards ── */
        <Box>
          {usuarios.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
              Nenhum colaborador ativo encontrado.
            </Typography>
          ) : (
            usuarios.map((usuario) => (
              <UsuarioCard
                key={resolverIdUsuario(usuario)}
                usuario={usuario}
                onAlterarSenha={abrirModalSenha}
                onInativar={handleInativar}
                onVincular={abrirModalVinculo}
                onDesvincular={abrirModalDesvinculo}
              />
            ))
          )}
        </Box>
      ) : (
        /* ── Layout desktop: tabela ── */
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer>
            <Table aria-label="Lista de colaboradores">
              <TableHead sx={{ bgcolor: '#f4f7f1' }}>
                <TableRow>
                  {['Nome', 'E-mail', 'Cargo', 'Ações'].map((col, i) => (
                    <TableCell
                      key={col}
                      align={i === 3 ? 'center' : 'left'}
                      sx={{ fontWeight: 'bold', color: '#1a3d0a' }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Nenhum colaborador ativo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={resolverIdUsuario(usuario)} hover>
                      <TableCell>{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.tipo || usuario.tipoUsuario}
                          size="small"
                          sx={{ bgcolor: '#AED696', color: '#1a3d0a', fontWeight: 'bold', fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Alterar Senha">
                          <IconButton onClick={() => abrirModalSenha(usuario)} sx={{ color: '#2d5a27' }} aria-label="Alterar senha">
                            <VpnKeyIcon />
                          </IconButton>
                        </Tooltip>

                        {ehFamiliar(usuario.tipo) && (
                          <Box sx={{ display: 'inline-flex', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => abrirModalVinculo(usuario)}>
                              Vincular
                            </Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => abrirModalDesvinculo(usuario)}>
                              Desvincular
                            </Button>
                          </Box>
                        )}

                        <Tooltip title="Remover Acesso">
                          <IconButton
                            onClick={() => handleInativar(resolverIdUsuario(usuario), usuario.nome)}
                            sx={{ color: '#d32f2f' }}
                            aria-label="Remover acesso"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* MODAL DE SENHA */}
      <Dialog open={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>Redefinir Senha</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Nova senha para <strong>{usuarioSelecionado?.nome}</strong>.
          </Typography>
          <TextField
            autoFocus margin="dense" label="Nova Senha" type="password" fullWidth variant="outlined"
            value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalSenhaAberto(false)}>Cancelar</Button>
          <Button onClick={handleSalvarSenha} variant="contained" sx={{ bgcolor: '#2d5a27' }}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL VINCULAR IDOSO */}
      <Dialog open={modalVinculoAberto} onClose={() => setModalVinculoAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Vincular Idoso</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Selecione o Idoso"
            value={idosoSelecionado}
            onChange={(e) => setIdosoSelecionado(e.target.value)}
            SelectProps={{ native: true }}
            margin="dense"
          >
            <option value=""></option>
            {listaIdosos.map((i) => (
              <option key={i.id} value={i.id}>{i.nome}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVinculoAberto(false)}>Cancelar</Button>
          <Button
            onClick={handleVincular}
            variant="contained"
            disabled={!idosoSelecionado}
            sx={{ bgcolor: '#2d5a27' }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DESVINCULAR IDOSO */}
      <Dialog open={modalDesvinculoAberto} onClose={() => setModalDesvinculoAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>Remover Vínculo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Remover idoso de: <strong>{usuarioSelecionado?.nome}</strong>
          </Typography>
          <TextField
            select fullWidth label="Idoso Vinculado"
            value={idosoSelecionado}
            onChange={(e) => setIdosoSelecionado(e.target.value)}
            SelectProps={{ native: true }}
            margin="dense"
          >
            <option value=""></option>
            {idososJaVinculados.map((i) => (
              <option key={i.id} value={i.id}>{i.nome}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDesvinculoAberto(false)}>Cancelar</Button>
          <Button
            variant="contained" color="error"
            disabled={!idosoSelecionado}
            onClick={() => {
              handleDesvincular(resolverIdUsuario(usuarioSelecionado), idosoSelecionado);
              setModalDesvinculoAberto(false);
            }}
          >
            Desvincular
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}