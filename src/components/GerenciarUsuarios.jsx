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

      {/* Feedbacks na tela */}
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
                      Nenhum colaborador ativo encontrado para este asilo.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    // O backend pode retornar "id" ou "usuarioId", garantimos o uso do correto
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
                        {/* Botão de Editar Senha */}
                        <Tooltip title="Alterar Senha">
                          <IconButton onClick={() => abrirModalSenha(usuario)} sx={{ color: '#2d5a27' }}>
                            <VpnKeyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Botão de Excluir/Inativar */}
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

      {/* MODAL DE EDIÇÃO DE SENHA */}
      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>
          Redefinir Senha
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Digite a nova senha de acesso para <b>{usuarioSelecionado?.nome}</b>.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Nova Senha"
            type="password"
            fullWidth
            variant="outlined"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalAberto(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleSalvarSenha} variant="contained" sx={{ bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' } }}>
            Salvar Senha
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}