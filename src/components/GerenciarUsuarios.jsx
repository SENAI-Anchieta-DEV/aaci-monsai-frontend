import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, 
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Chip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Ícone de chave para redefinir senha
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

export default function GerenciarUsuarios({ asiloId }) {
  // Inicializo as listas e os estados de controle da tela
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null, success: null });
  
  // Controlo a exibição e os dados do Modal de Edição de Senha
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');

  // Recupero o token de autenticação e configuro o cabeçalho padrão
  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [modalVinculoAberto, setModalVinculoAberto] = useState(false);
  const [listaIdosos, setListaIdosos] = useState([]);
  const [idosoSelecionado, setIdosoSelecionado] = useState('');

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
  // Busco os usuários da API e filtro de acordo com a regra de negócio
  const carregarUsuarios = useCallback(async () => {
    try {
      setStatus({ loading: true, error: null, success: null });
      
      const response = await axios.get('http://localhost:8080/usuarios', authHeaders);
      
      // Filtro para manter apenas usuários ativos que pertencem ao asilo do gestor logado
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
  // Processo a inativação lógica de um usuário no sistema
  const handleInativar = async (id, nome) => {
    const confirmar = window.confirm(`Tem certeza que deseja remover o acesso de ${nome}?`);
    if (!confirmar) return;

    try {
      // Envio o comando de exclusão para a API
      await axios.delete(`http://localhost:8080/usuarios/${id}`, authHeaders);
      
      setStatus({ loading: false, error: null, success: `Usuário ${nome} inativado com sucesso!` });
      
      // Removo o usuário do estado local para evitar um novo fetch na API
      setUsuarios(prev => prev.filter(u => u.id !== id && u.usuarioId !== id)); 
      
    } catch (err) {
      // Capturo possíveis violações de regra de negócio do backend
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao inativar usuário.";
      setStatus({ loading: false, error: msgErro, success: null });
    }
  };

  // ==========================================
  // 3. EDITAR (ATUALIZAR SENHA)
  // ==========================================
  // Preparo o estado para abrir o modal com o usuário selecionado
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

  // Valido e envio a nova senha para o servidor
  const handleSalvarSenha = async () => {
    if (novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Identifico o ID real do alvo, normalizando as propriedades do DTO
    const idAlvo = usuarioSelecionado.id || usuarioSelecionado.usuarioId;

    try {
      // Realizo a atualização parcial (PATCH) com a nova credencial
      await axios.patch(
        `http://localhost:8080/usuarios/${idAlvo}/senha`, 
        { novaSenha: novaSenha }, 
        authHeaders
      );
      
      // Fecho o modal e exibo mensagem de sucesso
      setModalAberto(false);
      setStatus({ loading: false, error: null, success: "Senha atualizada com sucesso!" });
      
    } catch (err) {
      // Capturo o erro retornado pelo backend
      const msgErro = err.response?.data?.detail || err.response?.data?.message || "Erro interno";
      alert("Erro ao atualizar a senha: " + msgErro);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
        Gerenciar Colaboradores
      </Typography>

      {status.success && <Alert severity="success" sx={{ mb: 2 }}>{status.success}</Alert>}
      {status.error && <Alert severity="error" sx={{ mb: 2 }}>{status.error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        {status.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress sx={{ color: '#2d5a27' }} />
          </Box>
        ) : (
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

                        {(usuario.tipo === 'FAMILIAR' || usuario.tipoUsuario === 'FAMILIAR') && (
                          <Tooltip title="Vincular Idoso">
                            <IconButton 
                              onClick={() => {
                                setUsuarioSelecionado(usuario);
                                setModalVinculoAberto(true);
                              }} 
                              sx={{ color: '#1a3d0a' }}
                            >
                              <PersonAddAltIcon />
                            </IconButton>
                          </Tooltip>
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
        )}
      </Paper>

      {/* MODAL DE SENHA */}
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

      {/* NOVO: MODAL DE VÍNCULO (O QUE ESTAVA FALTANDO) */}
      <Dialog open={modalVinculoAberto} onClose={() => setModalVinculoAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>Vincular Idoso</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selecione o idoso para <b>{usuarioSelecionado?.nome}</b>:
          </Typography>
          <TextField
            select
            fullWidth
            label="Idoso"
            value={idosoSelecionado}
            onChange={(e) => setIdosoSelecionado(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {listaIdosos.map((i) => (
              <option key={i.id} value={i.id}>{i.nome}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalVinculoAberto(false)}>Cancelar</Button>
          <Button 
            onClick={handleVincular} 
            variant="contained" 
            disabled={!idosoSelecionado}
            sx={{ bgcolor: '#2d5a27' }}
          >
            Vincular
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}