import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, IconButton, TextField, Typography, Chip, Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';

export default function GerenciarUsuarios({ asiloId }) {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");

  // 1. Busca usuários da API
  const carregarUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8080/usuarios");
      // Filtramos para mostrar apenas usuários do mesmo asilo
      const vinculados = res.data.filter(u => u.asiloId === parseInt(asiloId));
      setUsuarios(vinculados);
    } catch (err) {
      console.error("Erro ao carregar lista de usuários", err);
    }
  };

  useEffect(() => { carregarUsuarios(); }, []);

  // 2. Lógica de Inativação (DELETE na API)
  const handleInativar = async (id, nome) => {
    if (window.confirm(`Deseja realmente remover o acesso de ${nome}?`)) {
      try {
        await axios.delete(`http://localhost:8080/usuarios/${id}`);
        alert("Usuário inativado!");
        carregarUsuarios(); // Atualiza a lista
      } catch (err) {
        alert("Erro ao inativar usuário.");
      }
    }
  };

  // 3. Lógica de Reset de Senha (PATCH na API)
  const handleResetSenha = async (id) => {
    const novaSenha = prompt("Digite a nova senha para o usuário:");
    if (novaSenha) {
      try {
        await axios.patch(`http://localhost:8080/usuarios/${id}/senha`, { senha: novaSenha });
        alert("Senha atualizada com sucesso!");
      } catch (err) {
        alert("Erro ao atualizar senha.");
      }
    }
  };

  // Filtro de pesquisa em tempo real
  const usuariosFiltrados = usuarios.filter(u => 
    u.nome.toLowerCase().includes(busca.toLowerCase()) || u.cpf.includes(busca)
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a3d0a' }}>
        Gerenciar Equipe
      </Typography>

      <TextField 
        fullWidth 
        placeholder="Pesquisar por nome ou CPF..." 
        variant="outlined" 
        sx={{ mb: 3, bgcolor: 'white' }}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }}
        onChange={(e) => setBusca(e.target.value)}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f4f7f1' }}>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Perfil</strong></TableCell>
              <TableCell><strong>CPF</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosFiltrados.map((u) => (
              <TableRow key={u.usuarioId} hover>
                <TableCell>{u.nome}</TableCell>
                <TableCell><Chip label={u.tipo} size="small" variant="outlined" /></TableCell>
                <TableCell>{u.cpf}</TableCell>
                <TableCell>
                  <Chip 
                    label={u.ativo ? "Ativo" : "Inativo"} 
                    color={u.ativo ? "success" : "error"} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Alterar Senha">
                    <IconButton onClick={() => handleResetSenha(u.usuarioId)} color="primary">
                      <VpnKeyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Inativar Usuário">
                    <IconButton onClick={() => handleInativar(u.usuarioId, u.nome)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}