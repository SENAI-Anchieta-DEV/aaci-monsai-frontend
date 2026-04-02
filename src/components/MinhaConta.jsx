import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Divider, Avatar, Alert 
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

export default function MinhaConta() {
  // Pegamos os dados direto do localStorage, sem precisar de GET no servidor
  const [usuario] = useState({
    nome: localStorage.getItem('nomeUsuario') || 'Não informado',
    email: localStorage.getItem('emailUsuario') || 'Não informado',
    cpf: localStorage.getItem('cpfUsuario') || '000.000.000-00',
  });

  const [senhas, setSenhas] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Removemos o useEffect que fazia o GET, pois ele causa o erro 405/500

  const handleSenhaChange = (e) => setSenhas({ ...senhas, [e.target.name]: e.target.value });

  const handleAtualizarSenha = async () => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
        setMensagem({ texto: 'Sessão inválida.', tipo: 'error' });
        return;
    }
    
    if (senhas.novaSenha !== senhas.confirmarSenha) {
      setMensagem({ texto: 'As senhas não coincidem.', tipo: 'error' });
      return;
    }

    try {
      // O PATCH continua funcionando pois o seu log mostrou que a senha atualiza!
      await axios.patch(`http://localhost:8080/usuarios/${usuarioId}/senha`, {
        senhaAtual: senhas.senhaAtual,
        novaSenha: senhas.novaSenha
      });
      setMensagem({ texto: 'Senha atualizada com sucesso!', tipo: 'success' });
      setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error) {
      setMensagem({ texto: 'Erro ao atualizar. Senha atual incorreta?', tipo: 'error' });
    }
  };
  
  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" sx={{ color: '#1a3d0a', fontWeight: 'bold', mb: 1 }}>
        Minha Conta
      </Typography>

      {/* CARD DE INFORMAÇÕES PESSOAIS */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#AED696', color: '#1a3d0a', fontSize: '2rem', fontWeight: 'bold' }}>
            {usuario.nome.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>{usuario.nome}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Perfil: {localStorage.getItem('tipoPerfil')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ color: '#2d5a27', fontWeight: 600, mb: 3 }}>
          Dados Pessoais
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nome Completo" value={usuario.nome} disabled variant="filled" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="E-mail" value={usuario.email} disabled variant="filled" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="CPF" value={usuario.cpf} disabled variant="filled" />
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
          * A edição de dados pessoais está desativada.
        </Typography>
      </Paper>

      {/* CARD DE ALTERAÇÃO DE SENHA */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <LockResetIcon sx={{ color: '#2d5a27', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#2d5a27', fontWeight: 600 }}>
            Segurança da Conta
          </Typography>
        </Box>

        {mensagem.texto && (
          <Alert severity={mensagem.tipo} sx={{ mb: 3, borderRadius: '8px' }}>
            {mensagem.texto}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              type="password" 
              label="Senha Atual" 
              name="senhaAtual"
              value={senhas.senhaAtual}
              onChange={handleSenhaChange}
              variant="outlined" 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              type="password" 
              label="Nova Senha" 
              name="novaSenha"
              value={senhas.novaSenha}
              onChange={handleSenhaChange}
              variant="outlined" 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              type="password" 
              label="Confirmar Nova Senha" 
              name="confirmarSenha"
              value={senhas.confirmarSenha}
              onChange={handleSenhaChange}
              variant="outlined" 
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleAtualizarSenha}
            disabled={!senhas.senhaAtual || !senhas.novaSenha || !senhas.confirmarSenha}
            sx={{ 
              bgcolor: '#2d5a27', 
              px: 4, py: 1.2, 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#1a3d0a' }
            }}
          >
            Atualizar Senha
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}