import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, 
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Chip, useMediaQuery, useTheme, Stack, Card, CardContent, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Ícone de chave para redefinir senha
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

export default function GerenciarUsuarios({ asiloId }) {
  // Inicializa as listas e os estados de controle da tela
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null, success: null });
  
  // Controla a exibição e os dados do Modal de Edição de Senha
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');

  // Recupera o token de autenticação e configuro o cabeçalho padrão
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [modalVinculoAberto, setModalVinculoAberto] = useState(false);
  const [modalDesvinculoAberto, setModalDesvinculoAberto] = useState(false);

  const [listaIdosos, setListaIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState('');

  const idososJaVinculados = usuarioSelecionado?.idosos || [];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Função para carregar idosos do asilo - PARA OS FAMILIARES
const carregarIdosos = async () => {
  try {
    const res = await axios.get('http://localhost:8080/idosos', authHeaders);
    // Filtra idosos que pertencem ao asilo
    setListaIdosos(res.data);
  } catch (err) {
    console.error("Erro ao carregar idosos", err);
  }
};

  // ==========================================
  // 1. LISTAR USUÁRIOS
  // ==========================================
  // Busca os usuários da API e filtro de acordo com a regra de negócio
  const carregarUsuarios = useCallback(async () => {
    try {
      setStatus({ loading: true, error: null, success: null });
      
      const response = await axios.get('http://localhost:8080/usuarios', authHeaders);
      
      // Filtra para manter apenas usuários ativos que pertencem ao asilo do gestor logado
      const usuariosDoAsilo = response.data.filter(u => 
        u.asilo?.id === Number(asiloId) && u.ativo === true
      );
      
      setUsuarios(usuariosDoAsilo);
      setStatus({ loading: false, error: null, success: null });
      
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: "Erro ao carregar a lista de usuários.", success: null });
    }
  }, [asiloId, token]);

  useEffect(() => {
    carregarUsuarios();
    carregarIdosos();
  }, [carregarUsuarios]);

  // ==========================================
  // 2. EXCLUIR (INATIVAR) USUÁRIO
  // ==========================================
  // Processa a inativação lógica de um usuário no sistema
  const handleInativar = async (id, nome) => {
    const confirmar = window.confirm(`Tem certeza que deseja remover o acesso de ${nome}?`);
    if (!confirmar) return;

    try {
      // Envia o comando de exclusão para a API
      await axios.delete(`http://localhost:8080/usuarios/${id}`, authHeaders);
      
      setStatus({ loading: false, error: null, success: `Usuário ${nome} inativado com sucesso!` });
      
      // Remove o usuário do estado local para evitar um novo fetch na API
      setUsuarios(prev => prev.filter(u => u.id !== id && u.usuarioId !== id)); 
      
    } catch (err) {
      // Captura possíveis violações de regra de negócio do backend
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao inativar usuário.";
      setStatus({ loading: false, error: msgErro, success: null });
    }
  };

  // ==========================================
  // 3. EDITAR (ATUALIZAR SENHA)
  // ==========================================
  // Prepara o estado para abrir o modal com o usuário selecionado
  const abrirModalSenha = (usuario) => {
    setUsuarioSelecionado(usuario);
    setNovaSenha('');
    setModalAberto(true);
  };

   // ==========================================
  // 4. VINCULAR E DESVINCULAR IDOSO DE FAMILIAR
  // ==========================================
  // Função para vincular (chama seu endpoint POST /{idUsuario}/idosos/{idIdoso})
const handleVincular = async () => {
  try {
    const idUsuario = usuarioSelecionado.id || usuarioSelecionado.usuarioId;
    await axios.post(`http://localhost:8080/usuarios/${idUsuario}/idosos/${idosoSelecionado}`, {}, authHeaders);
    alert("Idoso vinculado com sucesso!");
    setModalVinculoAberto(false);
    carregarUsuarios(); // Recarrega a lista para mostrar o idoso vinculado
  } catch (err) {
    alert("Erro ao vincular: " + (err.response?.data?.detail || "Erro desconhecido"));
  }
};

const handleDesvincular = async (idUsuario, idIdoso) => {
    if (window.confirm("Deseja remover o vínculo deste idoso com este usuário?")) {
        try {
            await axios.delete(`http://localhost:8080/usuarios/${idUsuario}/idosos/${idIdoso}`, authHeaders);
            alert("Vínculo removido com sucesso!");
            carregarUsuarios(); // Atualiza a lista para refletir a mudança
        } catch (err) {
            alert("Erro ao desvincular: " + (err.response?.data?.message || "Erro interno"));
        }
    }
};

  // Valida e envio a nova senha para o servidor
  const handleSalvarSenha = async () => {
    if (novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Identifica o ID real do alvo, normalizando as propriedades do DTO
    const idAlvo = usuarioSelecionado.id || usuarioSelecionado.usuarioId;

    try {
      // Realiza a atualização parcial (PATCH) com a nova credencial
      await axios.patch(
        `http://localhost:8080/usuarios/${idAlvo}/senha`, 
        { novaSenha: novaSenha }, 
        authHeaders
      );
      
      // Fecha o modal e exibo mensagem de sucesso
      setModalAberto(false);
      setStatus({ loading: false, error: null, success: "Senha atualizada com sucesso!" });
      
    } catch (err) {
      // Captura o erro retornado pelo backend
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro interno";
      alert("Erro ao atualizar a senha: " + msgErro);
    }
  };
 // ── Cartão usado no layout mobile ──
  const UsuarioCard = ({ usuario }) => (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
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
              <IconButton onClick={() => abrirModalSenha(usuario)} sx={{ color: '#2d5a27' }}>
                <VpnKeyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remover Acesso">
              <IconButton onClick={() => handleInativar(usuario.id || usuario.usuarioId, usuario.nome)} sx={{ color: '#d32f2f' }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {(usuario.tipo === 'FAMILIAR' || usuario.tipo === 'ROLE_FAMILIAR') && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" gap={1}>
              <Button size="small" variant="outlined" fullWidth
                onClick={() => { setUsuarioSelecionado(usuario); setModalVinculoAberto(true); }}>
                Vincular
              </Button>
              <Button size="small" variant="outlined" color="error" fullWidth
                onClick={() => { setUsuarioSelecionado(usuario); setModalDesvinculoAberto(true); }}>
                Desvincular
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 2, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
        Gerenciar Colaboradores
      </Typography>

      {status.success && <Alert severity="success" sx={{ mb: 2 }}>{status.success}</Alert>}
      {status.error && <Alert severity="error" sx={{ mb: 2 }}>{status.error}</Alert>}

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
              <UsuarioCard key={usuario.id || usuario.usuarioId} usuario={usuario} />
            ))
          )}
        </Box>
      ) : (
        /* ── Layout desktop: tabela original ── */
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f7f1' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a3d0a' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a3d0a' }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a3d0a' }}>Cargo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#1a3d0a' }}>Ações</TableCell>
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
                    <TableRow key={usuario.id || usuario.usuarioId} hover>
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
                          <IconButton onClick={() => abrirModalSenha(usuario)} sx={{ color: '#2d5a27' }}>
                            <VpnKeyIcon />
                          </IconButton>
                        </Tooltip>
                        {(usuario.tipo === 'FAMILIAR' || usuario.tipo === 'ROLE_FAMILIAR') && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" onClick={() => { setUsuarioSelecionado(usuario); setModalVinculoAberto(true); }}>
                              Vincular
                            </Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => { setUsuarioSelecionado(usuario); setModalDesvinculoAberto(true); }}>
                              Desvincular
                            </Button>
                          </Box>
                        )}
                        <Tooltip title="Remover Acesso">
                          <IconButton 
                            onClick={() => handleInativar(usuario.id || usuario.usuarioId, usuario.nome)} 
                            sx={{ color: '#d32f2f' }}
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

      {/* MODAL DE SENHA — inalterado */}
      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>Redefinir Senha</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Nova senha para <b>{usuarioSelecionado?.nome}</b>.
          </Typography>
          <TextField
            autoFocus margin="dense" label="Nova Senha" type="password" fullWidth variant="outlined"
            value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button onClick={handleSalvarSenha} variant="contained" sx={{ bgcolor: '#2d5a27' }}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL VINCULAR — inalterado */}
      <Dialog open={modalVinculoAberto} onClose={() => setModalVinculoAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Vincular Idoso</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Selecione o Idoso" value={idosoSelecionado} 
            onChange={(e) => setIdosoSelecionado(e.target.value)} SelectProps={{ native: true }} margin="dense">
            <option value=""></option>
            {listaIdosos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalVinculoAberto(false)}>Cancelar</Button>
          <Button onClick={handleVincular} variant="contained" disabled={!idosoSelecionado} sx={{ bgcolor: '#2d5a27' }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DESVINCULAR — inalterado */}
      <Dialog open={modalDesvinculoAberto} onClose={() => setModalDesvinculoAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>Remover Vínculo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Remover idoso de: <b>{usuarioSelecionado?.nome}</b></Typography>
          <TextField select fullWidth label="Idoso Vinculado" value={idosoSelecionado} 
            onChange={(e) => setIdosoSelecionado(e.target.value)} SelectProps={{ native: true }} margin="dense">
            <option value=""></option>
            {idososJaVinculados.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalDesvinculoAberto(false)}>Cancelar</Button>
          <Button 
            onClick={() => {
              handleDesvincular(usuarioSelecionado.id || usuarioSelecionado.usuarioId, idosoSelecionado);
              setModalDesvinculoAberto(false);
            }} 
            variant="contained" color="error" disabled={!idosoSelecionado}
          >
            Desvincular
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}