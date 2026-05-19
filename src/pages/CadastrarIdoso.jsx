import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, Alert, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSerial, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';

export default function CadastrarIdoso({ gestorAsiloId }) {
  // Inicializa os dados base do idoso e vínculo obrigatório com o asilo atual
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    serialDispositivo: '',
    asiloId: gestorAsiloId,
  });
  const [erros, setErros] = useState({});
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  // Garante que o asiloId seja atualizado caso venha atrasado do componente pai
  useEffect(() => {
    if (gestorAsiloId) {
      setFormData((prev) => ({ ...prev, asiloId: gestorAsiloId }));
    }
  }, [gestorAsiloId]);

  // Gerencia mudanças nos inputs e aplica máscara de CPF
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cpf') value = mascararCPF(value);

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro do campo quando o usuário volta a digitar
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
  };

  // Validação front-end antes do envio
  const validarFormulario = () => {
    const novosErros = coletarErros({
      nome:              validarNome(formData.nome),
      email:             validarEmail(formData.email),
      cpf:               validarCPF(formData.cpf),
      serialDispositivo: validarSerial(formData.serialDispositivo),
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setStatus({ loading: true, error: null, success: false });

    try {
      const response = await api.post('/idosos', formData);

      // Limpa os dados em caso de sucesso absoluto
      setStatus({ loading: false, error: null, success: true });
      setFormData({ nome: '', cpf: '', email: '', serialDispositivo: '', asiloId: gestorAsiloId });

    } catch (err) {
      // Captura o disparo estruturado acima e joga na tela
      const mensagem = err.response?.data?.detail || err.response?.data?.message || err.message;
      setStatus({ loading: false, error: mensagem, success: false });
    }
  };

  return (
    <Box component="section" sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          component="h2"
          variant="h5"
          sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}
        >
          Vincular Novo Idoso (IoT)
        </Typography>

        {status.success && <Alert severity="success" sx={{ mb: 2 }}>Idoso e Pulseira vinculados!</Alert>}
        {status.error   && <Alert severity="error"   sx={{ mb: 2 }}>{status.error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth required
                label="Nome do Idoso" name="nome"
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
                fullWidth required
                label="ID da Pulseira (Serial)" name="serialDispositivo"
                value={formData.serialDispositivo} onChange={handleChange}
                error={!!erros.serialDispositivo} helperText={erros.serialDispositivo}
                placeholder="Ex: ABC-123"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth required
                label="Email do Familiar" name="email" type="email"
                value={formData.email} onChange={handleChange}
                error={!!erros.email} helperText={erros.email}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit" fullWidth variant="contained"
                disabled={status.loading}
                sx={{ mt: 2, bgcolor: '#2d5a27', py: 1.5 }}
              >
                {status.loading
                  ? <CircularProgress size={24} />
                  : 'Cadastrar e Ativar Monitoramento'
                }
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}