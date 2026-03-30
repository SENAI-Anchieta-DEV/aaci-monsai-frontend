import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid, Alert, CircularProgress } from '@mui/material';

export default function CadastrarIdoso({ gestorAsiloId }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    serialDispositivo: '',
    asiloId: gestorAsiloId || 1 
  });

  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8080/idosos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Erro ao cadastrar idoso.');
      }

      setStatus({ loading: false, error: null, success: true });
      setFormData({ nome: '', cpf: '', email: '', serialDispositivo: '', asiloId: gestorAsiloId });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
          Vincular Novo Idoso (IoT)
        </Typography>

        {status.success && <Alert severity="success" sx={{ mb: 2 }}>Idoso e Pulseira vinculados!</Alert>}
        {status.error && <Alert severity="error" sx={{ mb: 2 }}>{status.error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Nome do Idoso" name="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="CPF" name="cpf" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="ID da Pulseira (Serial)" name="serialDispositivo" value={formData.serialDispositivo} onChange={(e) => setFormData({...formData, serialDispositivo: e.target.value})} required placeholder="Ex: ABC-123" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Email do Familiar" name="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button type="submit" fullWidth variant="contained" disabled={status.loading} sx={{ mt: 2, bgcolor: '#2d5a27', py: 1.5 }}>
                {status.loading ? <CircularProgress size={24} /> : 'Cadastrar e Ativar Monitoramento'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}