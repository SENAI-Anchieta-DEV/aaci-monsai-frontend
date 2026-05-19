import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, MenuItem, 
  Alert, CircularProgress, Grid 
} from '@mui/material';
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSenha, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';

const TIPOS_USUARIO = ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'];

export default function CadastrarUsuario({ asiloId, onSucesso }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    tipoUsuario: 'CUIDADOR',
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [erros, setErros] = useState({});

  // Atualiza o estado do formulário dinamicamente conforme o usuário digita
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Aplica máscara de CPF em tempo real e limita caracteres
    if (name === 'cpf') value = mascararCPF(value);

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro do campo assim que o usuário volta a digitar
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
  };

  const validarFormulario = () => {
    const novosErros = coletarErros({
      nome:  validarNome(formData.nome),
      email: validarEmail(formData.email),
      cpf:   validarCPF(formData.cpf),
      senha: validarSenha(formData.senha),
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Submete os dados para a API ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Verifica e converte o ID do asilo para garantir que é um número válido
    const idAsilo = Number(asiloId);
    if (!idAsilo) {
      setStatus({ loading: false, error: 'ID do asilo inválido. Faça login novamente.', success: false });
      return;
    }

    setStatus({ loading: true, error: null, success: false });

    try {
      // Monta o payload final anexando o ID do asilo
      await api.post('/usuarios', { ...formData, asiloId: idAsilo });

      // Limpa os dados do formulário e indica sucesso na operação
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
    <Box component="section" sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
        <Typography
          component="h2"
          variant="h5"
          sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}
        >
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

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth required
                label="Nome Completo" name="nome"
                value={formData.nome} onChange={handleChange}
                error={!!erros.nome} helperText={erros.nome}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth required
                label="CPF" name="cpf"
                value={formData.cpf} onChange={handleChange}
                error={!!erros.cpf} helperText={erros.cpf || "000.000.000-00"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth select
                label="Tipo de Acesso" name="tipoUsuario"
                value={formData.tipoUsuario} onChange={handleChange}
              >
                {TIPOS_USUARIO.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth required
                label="E-mail" name="email" type="email"
                value={formData.email} onChange={handleChange}
                error={!!erros.email} helperText={erros.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth required
                label="Senha Provisória" name="senha" type="password"
                value={formData.senha} onChange={handleChange}
                error={!!erros.senha} helperText={erros.senha}
              />
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
        </Box>
      </Paper>
    </Box>
  );
}