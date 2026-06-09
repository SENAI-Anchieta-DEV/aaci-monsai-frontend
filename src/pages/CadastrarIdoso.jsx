import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, MenuItem, Grid, CircularProgress } from '@mui/material';
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSerial, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';
import { useToast } from '../components/ToastContext';

export default function CadastrarIdoso({ gestorAsiloId }) {
  const perfilLogado  = localStorage.getItem("tipoPerfil");
  const asiloIdLogado = localStorage.getItem("asiloId");
  const isSuperAdmin  = perfilLogado === 'SUPER_ADMIN';
  const asiloInicial  = isSuperAdmin ? '' : (gestorAsiloId || asiloIdLogado || '');

  const [formData, setFormData] = useState({
    nome: '', 
    cpf: '', 
    email: '', 
    serialDispositivo: '', 
    asiloId: asiloInicial,
  });
  const [asilos, setAsilos]     = useState([]);
  const [erros, setErros]       = useState({});
  const [loading, setLoading]   = useState(false);
  const showToast = useToast();

  // Carrega os asilos cadastrados caso o usuário logado seja um SUPER_ADMIN
  useEffect(() => {
    if (!isSuperAdmin) return;
    api.get('/asilos')
      .then((res) => setAsilos(res.data.filter((a) => a.ativo)))
      .catch(() => showToast({ type: "error", title: "Erro", message: "Não foi possível carregar as unidades." }));
  }, [isSuperAdmin, showToast]);

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
      asiloId:           (isSuperAdmin && !formData.asiloId) ? "Selecione uma unidade." : null,
    });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Se for Super Admin usa o ID selecionado no Select, senão usa o ID do asilo logado
    const idParaEnviar = isSuperAdmin ? Number(formData.asiloId) : Number(asiloInicial);

    if (!idParaEnviar) {
      showToast({ type: "error", title: "Erro", message: "ID da unidade não identificado." });
      return;
    }

    setLoading(true);
    try {
      await api.post('/idosos', { ...formData, asiloId: idParaEnviar });
      
      // Feedback visual de sucesso usando o Toast global
      showToast({ 
        type: "success", 
        title: "Idoso cadastrado!", 
        message: "Idoso e pulseira vinculados com sucesso." 
      });
      
      // Limpa os dados do formulário voltando para o estado inicial limpo
      setFormData({ nome: '', cpf: '', email: '', serialDispositivo: '', asiloId: asiloInicial });
    } catch (err) {
      // Captura o erro estruturado vindo do backend detalhadamente
      const mensagem = err.response?.data?.detail || err.response?.data?.message || err.message;
      showToast({ type: "error", title: "Erro ao cadastrar", message: mensagem });
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
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>

            {/* Renderização condicional da seleção de Asilo apenas para SUPER_ADMIN */}
            {isSuperAdmin && (
              <Grid item xs={12}>
                <TextField 
                  fullWidth select required 
                  label="Unidade (Asilo)" name="asiloId"
                  value={formData.asiloId} onChange={handleChange}
                  error={!!erros.asiloId} helperText={erros.asiloId || "Selecione a unidade do idoso"}
                >
                  <MenuItem value=""><em>Selecione...</em></MenuItem>
                  {asilos.map((a) => (
                    <MenuItem key={a.id} value={a.id}>{a.nome}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

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
                disabled={loading}
                sx={{ mt: 2, bgcolor: '#2d5a27', py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Cadastrar e Ativar Monitoramento'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}