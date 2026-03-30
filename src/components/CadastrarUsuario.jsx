import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, MenuItem, 
  Alert, CircularProgress, Grid 
} from '@mui/material';

export default function CadastrarUsuario() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    tipoUsuario: 'CUIDADOR', // Valor padrão do seu Enum
    asiloId: 1 // Idealmente viria do perfil do gestor logado
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const tipos = ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus({ loading: true, error: null, success: false });

  // 1. Pegar o token guardado no navegador
  const token = localStorage.getItem('token'); 

  try {
    const response = await fetch('http://localhost:8080/usuarios', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 2. Enviar o token no padrão Bearer
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(formData),
    });

    // 3. Melhorar o tratamento de erro para você saber o que houve
    if (response.status === 403) {
      throw new Error('Acesso Negado: Você não tem permissão de Gestor.');
    }
    
    if (response.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao cadastrar usuário.');
    }

    setStatus({ loading: false, error: null, success: true });
    // ... limpa o form
  } catch (err) {
    setStatus({ loading: false, error: err.message, success: false });
  }
};

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: 'white' }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
          Cadastrar Novo Colaborador
        </Typography>

        {status.success && <Alert severity="success" sx={{ mb: 2 }}>Usuário cadastrado com sucesso!</Alert>}
        {status.error && <Alert severity="error" sx={{ mb: 2 }}>{status.error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth select label="Tipo de Acesso" name="tipoUsuario" 
                value={formData.tipoUsuario} onChange={handleChange}
              >
                {tipos.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Senha Provisória" name="senha" type="password" value={formData.senha} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" fullWidth variant="contained" 
                disabled={status.loading}
                sx={{ mt: 2, bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' }, py: 1.5 }}
              >
                {status.loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Cadastro'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}