import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, MenuItem, 
  CircularProgress, Grid 
} from '@mui/material';

// Importações com os caminhos corretos a partir da pasta pages/
import api from '../utils/api';
import { validarNome, validarEmail, validarCPF, validarSenha, coletarErros } from '../utils/validators';
import { mascararCPF } from '../utils/masks';
import { useToast } from '../components/ToastContext'; // 🌟 Adicionado o contexto de Toast

const TIPOS_USUARIO = ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'];

export default function CadastrarUsuario({ asiloId, onSucesso }) {
  const showToast = useToast(); // Instanciando o Toast
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    tipoUsuario: 'CUIDADOR',
  });
  
  // 🌟 O estado de status foi simplificado apenas para 'loading'
  const [loading, setLoading] = useState(false);
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
      showToast({ 
        type: "error", 
        title: "Sessão Inválida", 
        message: "ID do asilo inválido. Faça login novamente." 
      });
      return;
    }

    setLoading(true);

    try {
      // Monta o payload final anexando o ID do asilo
      await api.post('/usuarios', { ...formData, asiloId: idAsilo });

      // 🌟 Troca o <Alert> pelo Toast de sucesso
      showToast({ 
        type: "success", 
        title: "Sucesso!", 
        message: "Usuário cadastrado com sucesso!" 
      });
      
      // Limpa os dados do formulário
      setFormData({ nome: '', email: '', senha: '', cpf: '', tipoUsuario: 'CUIDADOR' });

      // Chama o callback opcional para notificar componentes pai (como o Dashboard)
      if (onSucesso) onSucesso();

    } catch (err) {
      // Captura o erro disparado pelo GlobalExceptionHandler do Spring Boot
      const mensagemErro = err.response?.data?.detail || err.response?.data?.message || "Erro ao conectar com o servidor.";
      
      // 🌟 Troca o <Alert> pelo Toast de erro
      showToast({ 
        type: "error", 
        title: "Falha no Cadastro", 
        message: mensagemErro 
      });
    } finally {
      setLoading(false);
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

        {/* 🌟 Os <Alert> que ficavam aqui foram removidos, deixando o layout mais limpo */}

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
                disabled={loading} // 🌟 Ajustado para o novo estado
                sx={{ mt: 2, bgcolor: '#2d5a27', '&:hover': { bgcolor: '#1a3d0a' }, py: 1.5, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Finalizar Cadastro'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}