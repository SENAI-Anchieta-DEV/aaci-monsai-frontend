  import React, { useState } from 'react';
  import axios from 'axios'; // Padronizando com seu projeto
  import { 
    Box, TextField, Button, Typography, Paper, MenuItem, 
    Alert, CircularProgress, Grid 
  } from '@mui/material';

  export default function CadastrarUsuario({ asiloId, onSucesso }) {
  // Inicializa os estados do formulário com valores padrão
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    tipoUsuario: 'CUIDADOR',
  });

  // Cria o estado para gerenciar o feedback visual (carregamento, sucesso e erro)
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const tipos = ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'];

  // Atualiza o estado do formulário dinamicamente conforme o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submete os dados para a API ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    // Verifica e converte o ID do asilo para garantir que é um número válido
    const idAsilo = Number(asiloId);
    if (!idAsilo) {
      setStatus({ loading: false, error: 'ID do asilo inválido. Faça login novamente.', success: false });
      return;
    }

    // Monta o payload final anexando o ID do asilo
    const payload = { ...formData, asiloId: idAsilo };

    try {
      // Realiza a requisição POST para o backend
      await axios.post('http://localhost:8080/usuarios', payload);
      
      // Limpa os dados do formulário e indico sucesso na operação
      setStatus({ loading: false, error: null, success: true });
      setFormData({ nome: '', email: '', senha: '', cpf: '', tipoUsuario: 'CUIDADOR' });
      
      // Chama o callback opcional para notificar componentes pai (como o Dashboard)
      if (onSucesso) onSucesso();
      
    } catch (err) {
      // Captura o erro disparado pelo GlobalExceptionHandler (buscando a propriedade 'detail' do ProblemDetail)
      const mensagemErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao conectar com o servidor.";
      setStatus({ loading: false, error: mensagemErro, success: false });
    }
  };

    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
            Novo Colaborador
          </Typography>

          {status.success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Usuário cadastrado com sucesso!
            </Alert>
          )}
          
          {status.error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {status.error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Nome Completo" name="nome" value={formData.nome} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Tipo de Acesso" name="tipoUsuario" value={formData.tipoUsuario} onChange={handleChange}>
                  {tipos.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
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
                  sx={{ mt: 2, bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' }, py: 1.5, borderRadius: 2 }}
                >
                  {status.loading ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    );
  }