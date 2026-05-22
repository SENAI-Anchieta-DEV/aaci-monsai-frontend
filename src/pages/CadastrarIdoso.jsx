import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSerial, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';
import { useToast } from '../components/ToastContext'; // 🌟 Adicionado

export default function CadastrarIdoso({ gestorAsiloId }) {
  const showToast = useToast(); // 🌟 Instanciando o Toast
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    serialDispositivo: '',
    asiloId: gestorAsiloId,
  });
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false); // 🌟 Simplificado: só loading agora

  useEffect(() => {
    if (gestorAsiloId) {
      setFormData((prev) => ({ ...prev, asiloId: gestorAsiloId }));
    }
  }, [gestorAsiloId]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = mascararCPF(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
  };

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

    setLoading(true);

    try {
      await api.post('/idosos', formData);

      // 🌟 Substituiu o Alert de sucesso
      showToast({
        type: "success",
        title: "Sucesso!",
        message: "Idoso e Pulseira vinculados!",
      });

      setFormData({ nome: '', cpf: '', email: '', serialDispositivo: '', asiloId: gestorAsiloId });

    } catch (err) {
      const mensagem = err.response?.data?.detail || err.response?.data?.message || err.message;

      // 🌟 Substituiu o Alert de erro
      showToast({
        type: "error",
        title: "Falha no Cadastro",
        message: mensagem,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="section" sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography component="h2" variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
          Vincular Novo Idoso (IoT)
        </Typography>

        {/* 🌟 Alerts removidos — layout mais limpo */}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Nome do Idoso" name="nome"
                value={formData.nome} onChange={handleChange}
                error={!!erros.nome} helperText={erros.nome} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="CPF" name="cpf"
                value={formData.cpf} onChange={handleChange}
                error={!!erros.cpf} helperText={erros.cpf || "000.000.000-00"} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="ID da Pulseira (Serial)" name="serialDispositivo"
                value={formData.serialDispositivo} onChange={handleChange}
                error={!!erros.serialDispositivo} helperText={erros.serialDispositivo}
                placeholder="Ex: ABC-123" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth required label="Email do Familiar" name="email" type="email"
                value={formData.email} onChange={handleChange}
                error={!!erros.email} helperText={erros.email} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained"
                disabled={loading}
                sx={{ mt: 2, bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' }, py: 1.5, borderRadius: 2 }}>
                {loading ? <CircularProgress size={24} /> : 'Cadastrar e Ativar Monitoramento'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}