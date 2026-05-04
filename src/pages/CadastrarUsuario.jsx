import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, MenuItem, CircularProgress, Grid } from '@mui/material';
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSenha, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';
import { useToast } from '../components/ToastContext';

const TIPOS_USUARIO = ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'];

// 1. Renomeamos o parâmetro para 'asiloIdProp' para evitar conflito com o estado interno
export default function CadastrarUsuario({ asiloId: asiloIdProp, onSucesso }) {
  const perfilLogado = localStorage.getItem("tipoPerfil");
  const asiloIdLogado = localStorage.getItem("asiloId");
  const isSuperAdmin = perfilLogado === 'SUPER_ADMIN';
  // 2. Agora 'asiloIdProp' está definido e pode ser usado aqui
  const asiloInicial = isSuperAdmin ? '' : (asiloIdProp || asiloIdLogado || '');
  const [formData, setFormData] = useState({
    nome: '', 
    email: '', 
    senha: '', 
    cpf: '', 
    tipoUsuario: 'CUIDADOR', 
    // 3. CORREÇÃO: Em vez de usar 'asiloId' (que não existe mais), 
    // usamos o 'asiloInicial' que já tem a lógica correta.
    asiloId: asiloInicial, 
  });
  const [asilos, setAsilos]   = useState([]);          // ← lista para SUPER_ADMIN
  const [loading, setLoading] = useState(false);
  const [erros, setErros]     = useState({});
  const showToast = useToast();


  // ── Busca os asilos só quando SUPER_ADMIN ──────────────────────────────────
  useEffect(() => {
    if (!isSuperAdmin) return;
    api.get('/asilos')
      .then((res) => setAsilos(res.data.filter((a) => a.ativo)))
      .catch(() => showToast({ type: "error", title: "Erro", message: "Não foi possível carregar as unidades." }));
  }, [isSuperAdmin, showToast]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = mascararCPF(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
  };

  const validarFormulario = () => {
    const novosErros = coletarErros({
      nome:    validarNome(formData.nome),
      email:   validarEmail(formData.email),
      cpf:     validarCPF(formData.cpf),
      senha:   validarSenha(formData.senha),
      // Só exige selecionar o asilo se for Super Admin
      asiloId: (isSuperAdmin && !formData.asiloId) ? "Selecione uma unidade." : null,  
    });
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Garante que o ID do asilo vá preenchido, mesmo que o Gestor não veja o campo
    const idParaEnviar = isSuperAdmin ? Number(formData.asiloId) : Number(asiloInicial);

    if (!idParaEnviar) {
      showToast({ type: "error", title: "Erro", message: "ID da unidade não identificado." });
      return;
    }

    setLoading(true);
    try {
      await api.post('/usuarios', { ...formData, asiloId: idParaEnviar });
      showToast({ type: "success", title: "Usuário cadastrado!", message: "O novo colaborador foi criado com sucesso." });
      
      // Reseta o form, mantendo o asiloInicial travado para o Gestor
      setFormData({ 
        nome: '', email: '', senha: '', cpf: '', tipoUsuario: 'CUIDADOR', asiloId: asiloInicial 
      });
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

            {/* ── Seletor de unidade — só aparece para SUPER_ADMIN ── */}
            {isSuperAdmin && (
              <Grid item xs={12}>
                <TextField fullWidth select required label="Unidade (Asilo)" name="asiloId"
                  value={formData.asiloId} onChange={handleChange}
                  error={!!erros.asiloId} helperText={erros.asiloId || "Selecione a qual unidade esse usuário pertence (Apenas ADMIN)"}>
                  <MenuItem value=""><em>Selecione...</em></MenuItem>
                  {asilos.map((a) => (
                    <MenuItem key={a.id} value={a.id}>{a.nome}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

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