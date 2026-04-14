import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, MenuItem, CircularProgress, Grid } from '@mui/material';
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSenha, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';
import { useToast } from '../components/ToastContext';

const TIPOS_USUARIO = ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'];

export default function CadastrarUsuario({ asiloId, onSucesso }) {
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', cpf: '', tipoUsuario: 'CUIDADOR',
  });
  const [loading, setLoading] = useState(false);
  const [erros, setErros]     = useState({});
  const showToast = useToast();

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = mascararCPF(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const idAsilo = Number(asiloId);
    if (!idAsilo) {
      showToast({ type: "error", title: "Sessão inválida", message: "ID do asilo inválido. Faça login novamente." });
      return;
    }

    setLoading(true);
    try {
      await api.post('/usuarios', { ...formData, asiloId: idAsilo });
      showToast({ type: "success", title: "Usuário cadastrado!", message: "O novo colaborador foi criado com sucesso." });
      setFormData({ nome: '', email: '', senha: '', cpf: '', tipoUsuario: 'CUIDADOR' });
      if (onSucesso) onSucesso();
    } catch (err) {
      const mensagemErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao conectar com o servidor.";
      showToast({ type: "error", title: "Erro ao cadastrar", message: mensagemErro });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="section" sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
        <Typography component="h2" variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
          Novo Colaborador
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Nome Completo" name="nome"
                value={formData.nome} onChange={handleChange}
                error={!!erros.nome} helperText={erros.nome} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="CPF" name="cpf"
                value={formData.cpf} onChange={handleChange}
                error={!!erros.cpf} helperText={erros.cpf || "000.000.000-00"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Tipo de Acesso" name="tipoUsuario"
                value={formData.tipoUsuario} onChange={handleChange}>
                {TIPOS_USUARIO.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="E-mail" name="email" type="email"
                value={formData.email} onChange={handleChange}
                error={!!erros.email} helperText={erros.email} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="Senha Provisória" name="senha" type="password"
                value={formData.senha} onChange={handleChange}
                error={!!erros.senha} helperText={erros.senha} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" disabled={loading}
                sx={{ mt: 2, bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' }, py: 1.5, borderRadius: 2 }}>
                {loading ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}