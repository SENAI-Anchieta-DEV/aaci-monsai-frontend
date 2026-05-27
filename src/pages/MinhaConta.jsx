import React, { useState } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Divider, Avatar
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import SaveIcon      from '@mui/icons-material/Save';
import api           from '../utils/api';
import { useAuth }   from '../hooks/useAuth';
import { validarConfirmacaoSenha, validarSenha } from '../utils/validators';
import { useToast }  from '../components/ToastContext';

export default function MinhaConta() {
  const { nome, email, cpf, perfil, usuarioId } = useAuth();
  const [senhas, setSenhas] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  const showToast = useToast();

  const handleSenhaChange = (e) => setSenhas({ ...senhas, [e.target.name]: e.target.value });

  const handleAtualizarSenha = async () => {
    if (!usuarioId) {
      showToast({ type: "error", title: "Sessão inválida", message: "Faça login novamente." });
      return;
    }

    const erroNovaSenha   = validarSenha(senhas.novaSenha);
    const erroConfirmacao = validarConfirmacaoSenha(senhas.novaSenha, senhas.confirmarSenha);

    if (erroNovaSenha || erroConfirmacao) {
      showToast({ type: "error", title: "Senha inválida", message: erroNovaSenha || erroConfirmacao });
      return;
    }

    try {
      await api.patch(`/usuarios/${usuarioId}/senha`, {
        senhaAtual: senhas.senhaAtual,
        novaSenha:  senhas.novaSenha,
      });
      showToast({ type: "success", title: "Senha atualizada!", message: "Sua nova senha está ativa." });
      setSenhas({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch {
      showToast({ type: "error", title: "Erro ao atualizar", message: "Senha atual incorreta ou erro no servidor." });
    }
  };

  return (
    <Box component="section" aria-labelledby="titulo-minha-conta"
      sx={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography id="titulo-minha-conta" variant="h4" sx={{ color: '#1a3d0a', fontWeight: 'bold', mb: 1 }}>
        Minha Conta
      </Typography>

      {/* INFORMAÇÕES PESSOAIS */}
      <Paper component="article" elevation={0}
        sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#AED696', color: '#1a3d0a', fontSize: '2rem', fontWeight: 'bold' }}>
            {nome.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>{nome}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>Perfil: {perfil}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ color: '#2d5a27', fontWeight: 600, mb: 3 }}>Dados Pessoais</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nome Completo" value={nome}  disabled variant="filled" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="E-mail"        value={email} disabled variant="filled" />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="CPF"           value={cpf}   disabled variant="filled" />
          </Grid>
        </Grid>
        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
          * A edição de dados pessoais está desativada.
        </Typography>
      </Paper>

      {/* ALTERAÇÃO DE SENHA */}
      <Paper component="article" elevation={0}
        sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <LockResetIcon sx={{ color: '#2d5a27', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#2d5a27', fontWeight: 600 }}>Segurança da Conta</Typography>
        </Box>
        <Grid container spacing={3}>
          {[
            { name: 'senhaAtual',     label: 'Senha Atual' },
            { name: 'novaSenha',      label: 'Nova Senha' },
            { name: 'confirmarSenha', label: 'Confirmar Nova Senha' },
          ].map(({ name, label }) => (
            <Grid key={name} item xs={12} md={4}>
              <TextField fullWidth type="password" label={label} name={name}
                value={senhas[name]} onChange={handleSenhaChange} variant="outlined" />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleAtualizarSenha}
            disabled={!senhas.senhaAtual || !senhas.novaSenha || !senhas.confirmarSenha}
            sx={{ bgcolor: '#2d5a27', px: 4, py: 1.2, borderRadius: '8px',
              textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#1a3d0a' } }}>
            Atualizar Senha
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}