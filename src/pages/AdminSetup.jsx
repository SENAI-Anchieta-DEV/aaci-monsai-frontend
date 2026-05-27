import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  TextField, Paper, Container, Divider 
} from "@mui/material";
// Importando o seu context
import { useToast } from '../components/ToastContext'; 

import { validarNome, validarEmail, validarCPF, validarSenha, coletarErros } from '../utils/validators';
import { mascararCPF, mascararCNPJ } from '../utils/masks';
import api from '../utils/api';

// ─── Formulário do Gestor (Passo 2) ──────────────────────────────────────────
export const FormularioCadastroGestor = ({ asiloId, onFinish }) => {
  const showToast = useToast(); 
  const [gestor, setGestor] = useState({ nome: '', email: '', senha: '', cpf: '' });
  const [erros, setErros] = useState({});

  const handleSubmit = async () => {
    const novosErros = coletarErros({
      nome:  validarNome(gestor.nome),
      email: validarEmail(gestor.email),
      cpf:   validarCPF(gestor.cpf),
      senha: validarSenha(gestor.senha),
    });

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      await api.post("/usuarios", { ...gestor, tipoUsuario: "GESTOR", asiloId });

      showToast({
        type: "success",
        title: "Sucesso!",
        message: "Configuração finalizada. Por favor, faça login novamente."
      });
      
      if (onFinish) onFinish();

    } catch (error) {
      console.error("Erro na requisição:", error.response?.data || error.message);

      const mensagem = error.response?.data?.detail || error.response?.data?.message || "Verifique se CPF ou Email já estão cadastrados.";
      
      showToast({
        type: "error",
        title: "Erro no Cadastro",
        message: mensagem
      });
    }
  };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a3d0a' }}>
        Passo 2: Cadastro do Gestor Responsável
      </Typography>

      <Divider />

      <TextField
        label="Nome do Gestor" fullWidth variant="filled"
        value={gestor.nome}
        error={!!erros.nome}
        helperText={erros.nome}
        onChange={(e) => setGestor({ ...gestor, nome: e.target.value })}
      />
      <TextField
        label="Email" fullWidth variant="filled"
        value={gestor.email}
        error={!!erros.email}
        helperText={erros.email}
        onChange={(e) => setGestor({ ...gestor, email: e.target.value })}
      />
      <TextField
        label="CPF" fullWidth variant="filled"
        value={gestor.cpf}
        error={!!erros.cpf}
        helperText={erros.cpf || "000.000.000-00"}
        onChange={(e) => setGestor({ ...gestor, cpf: mascararCPF(e.target.value) })}
      />
      <TextField
        label="Senha" type="password" fullWidth variant="filled"
        value={gestor.senha}
        error={!!erros.senha}
        helperText={erros.senha}
        onChange={(e) => setGestor({ ...gestor, senha: e.target.value })}
      />

      <Button
        variant="contained" fullWidth size="large"
        onClick={handleSubmit}
        sx={{ mt: 2, bgcolor: "#2d5a27", py: 1.5, fontWeight: 'bold' }}
      >
        Finalizar e Salvar Unidade
      </Button>
    </Box>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function OnBoardingAdmin({ onFinish, onLogout }) {
  const showToast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [asiloData, setAsiloData] = useState({ nome: '', cnpj: '', endereco: '' });
  const [asiloId, setAsiloId] = useState(null);
  const [erros, setErros] = useState({});

  const steps = ['Dados do Asilo', 'Gestor Responsável'];

  const handleCriarAsilo = async () => {
    const novosErros = coletarErros({
      nome: validarNome(asiloData.nome),
      cnpj: asiloData.cnpj.replace(/\D/g, '').length !== 14 ? "CNPJ deve ter 14 dígitos." : null,
    });

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    try {
      const res = await api.post("/asilos", asiloData);
      setAsiloId(res.data.id || res.data.asilo_id);
      
      showToast({
        type: "success",
        title: "Unidade Criada",
        message: "Agora cadastre o gestor da unidade."
      });
      
      setActiveStep(1);
    } catch (error) {
      console.error("Erro ao criar asilo:", error);
      showToast({
        type: "error",
        title: "Falha na Criação",
        message: "Verifique os dados da unidade ou se o CNPJ já existe."
      });
    }
  };

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#c8ddb8", display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 5, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: "#2d5a27", fontWeight: 800, mb: 1 }}>MONSAI</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Configuração Inicial de Nova Unidade
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nome da Unidade (Asilo)" fullWidth
                value={asiloData.nome}
                error={!!erros.nome}
                helperText={erros.nome}
                onChange={(e) => setAsiloData({ ...asiloData, nome: e.target.value })}
              />
              <TextField
                label="CNPJ" fullWidth
                value={asiloData.cnpj}
                error={!!erros.cnpj}
                helperText={erros.cnpj || "00.000.000/0000-00"}
                onChange={(e) => setAsiloData({ ...asiloData, cnpj: mascararCNPJ(e.target.value) })}
              />
              <TextField
                label="Endereço Completo" fullWidth
                value={asiloData.endereco}
                onChange={(e) => setAsiloData({ ...asiloData, endereco: e.target.value })}
              />

              <Button
                variant="contained"
                onClick={handleCriarAsilo}
                sx={{ bgcolor: "#2d5a27", mt: 2, py: 1.5 }}
              >
                Próximo: Cadastrar Gestor
              </Button>
            </Box>
          ) : (
            <FormularioCadastroGestor asiloId={asiloId} onFinish={onFinish} />
          )}

          <Button
            onClick={onLogout}
            fullWidth
            sx={{ mt: 4, color: 'gray', textTransform: 'none', fontWeight: 500 }}
          >
            Sair do Painel Admin
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}