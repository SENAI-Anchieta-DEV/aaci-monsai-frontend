import React, { useState } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  TextField, Paper, Container, Divider, InputAdornment, IconButton 
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Ícones Premium para o UX
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useToast } from '../components/ToastContext'; 
import { validarNome, validarEmail, validarCPF, validarSenha, coletarErros } from '../utils/validators';
import { mascararCPF, mascararCNPJ } from '../utils/masks';
import api from '../utils/api';
import logoCompleta from "../assets/logos/Logo_completa.png";

// ─── Tema MONSAI Premium (Consistente com Login) ──────────────────────────────
const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary: { main: "#4fa825" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    button: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "none", letterSpacing: "0.5px" },
  },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          borderRadius: 12, 
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        } 
      } 
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease-in-out",
            "& fieldset": { borderColor: "rgba(42, 92, 20, 0.2)" },
            "&:hover fieldset": { borderColor: "rgba(42, 92, 20, 0.5)" },
            "&.Mui-focused fieldset": { borderColor: "#4fa825", borderWidth: "2px" },
            "&.Mui-focused": { backgroundColor: "#ffffff", boxShadow: "0 4px 12px rgba(79, 168, 37, 0.1)" }
          }
        }
      }
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "rgba(42, 92, 20, 0.3)", // Cor inativa
          "&.Mui-active": { color: "#4fa825" },
          "&.Mui-completed": { color: "#2a5c14" },
        }
      }
    }
  },
});

// ─── Formulário do Gestor (Passo 2) ──────────────────────────────────────────
export const FormularioCadastroGestor = ({ asiloId, onFinish }) => {
  const showToast = useToast(); 
  const [gestor, setGestor] = useState({ nome: '', email: '', senha: '', cpf: '' });
  const [erros, setErros] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
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
      
      showToast({ type: "error", title: "Erro no Cadastro", message: mensagem });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1, animation: "fadeIn 0.5s ease" }}>
      <Box>
        <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>Nome do Gestor Responsável</Typography>
        <TextField
          placeholder="Ex: João da Silva" fullWidth variant="outlined"
          value={gestor.nome}
          error={!!erros.nome}
          helperText={erros.nome}
          onChange={(e) => setGestor({ ...gestor, nome: e.target.value })}
          InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: "#4fa825" }} /></InputAdornment> }}
        />
      </Box>

      <Box>
        <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>E-mail Institucional</Typography>
        <TextField
          placeholder="gestor@asilo.com.br" fullWidth variant="outlined"
          value={gestor.email}
          error={!!erros.email}
          helperText={erros.email}
          onChange={(e) => setGestor({ ...gestor, email: e.target.value })}
          InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: "#4fa825" }} /></InputAdornment> }}
        />
      </Box>

      <Box>
        <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>CPF</Typography>
        <TextField
          placeholder="000.000.000-00" fullWidth variant="outlined"
          value={gestor.cpf}
          error={!!erros.cpf}
          helperText={erros.cpf}
          onChange={(e) => setGestor({ ...gestor, cpf: mascararCPF(e.target.value) })}
          InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: "#4fa825" }} /></InputAdornment> }}
        />
      </Box>

      <Box>
        <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>Senha de Acesso</Typography>
        <TextField
          placeholder="••••••••" type={showPassword ? "text" : "password"} fullWidth variant="outlined"
          value={gestor.senha}
          error={!!erros.senha}
          helperText={erros.senha}
          onChange={(e) => setGestor({ ...gestor, senha: e.target.value })}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#4fa825" }} /></InputAdornment>,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff sx={{ color: "#4a6b3b" }} /> : <Visibility sx={{ color: "#4a6b3b" }} />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Button
        variant="contained" fullWidth
        onClick={handleSubmit}
        disabled={loading}
        endIcon={<CheckCircleOutlineIcon />}
        sx={{ 
          mt: 2, bgcolor: "#2a5c14", py: 1.5, fontSize: "1.05rem",
          boxShadow: "0 8px 24px rgba(42,92,20,0.3)",
          "&:hover": { bgcolor: "#1a3d0a", transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(26,61,10,0.4)" }
        }}
      >
        {loading ? "Salvando..." : "Finalizar e Salvar Unidade"}
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
  const [loading, setLoading] = useState(false);

  const steps = ['Dados da Instituição', 'Gestor Responsável'];

  const handleCriarAsilo = async () => {
    const novosErros = coletarErros({
      nome: validarNome(asiloData.nome),
      cnpj: asiloData.cnpj.replace(/\D/g, '').length !== 14 ? "CNPJ deve ter 14 dígitos." : null,
      endereco: asiloData.endereco.length < 5 ? "Insira um endereço válido." : null,
    });

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/asilos", asiloData);
      setAsiloId(res.data.id || res.data.asilo_id);
      
      showToast({ type: "success", title: "Unidade Criada", message: "Agora cadastre o gestor da unidade." });
      setActiveStep(1);
    } catch (error) {
      console.error("Erro ao criar asilo:", error);
      showToast({ type: "error", title: "Falha na Criação", message: "Verifique os dados da unidade ou se o CNPJ já existe." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        component="main" 
        sx={{ 
          minHeight: "100vh", 
          background: "radial-gradient(circle at 85% 10%, #e4f0dc 0%, #c8ddb8 50%, #a8d58a 100%)", 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
          px: 2,
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Glow de fundo */}
        <Box sx={{ position: "absolute", top: "-5%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(126,196,79,0.2) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              background: "rgba(255, 255, 255, 0.85)", 
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              borderRadius: "24px", 
              p: { xs: "2rem 1.5rem", sm: "3rem 3.5rem" }, 
              textAlign: 'center',
              boxShadow: "0 24px 48px -12px rgba(26, 61, 10, 0.2)",
              animation: "monsai-modalIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              "@keyframes monsai-modalIn": {
                from: { opacity: 0, transform: "scale(0.96) translateY(20px)" },
                to: { opacity: 1, transform: "scale(1) translateY(0)" }
              }
            }}
          >
            {/* Logo opcional no topo */}
            <Box component="img" src={logoCompleta} alt="MONSAI Logo" sx={{ width: 150, mx: "auto", mb: 2, display: "block" }} onError={(e) => e.target.style.display = 'none'} />
            
            <Typography variant="h5" sx={{ color: "#1a3d0a", fontWeight: 800, mb: 0.5, letterSpacing: "-0.5px" }}>
              Setup de Unidade
            </Typography>
            <Typography variant="body2" sx={{ color: "#4a6b3b", mb: 4, fontWeight: 500 }}>
              Configure a infraestrutura para iniciar o monitoramento
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel sx={{ "& .MuiStepLabel-label": { fontWeight: 600, mt: 1 } }}>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 3, opacity: 0.6 }} />

            {activeStep === 0 ? (
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, animation: "fadeIn 0.5s ease" }}>
                <Box>
                  <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>Nome do Asilo / Instituição</Typography>
                  <TextField
                    placeholder="Ex: Recanto dos Idosos" fullWidth variant="outlined"
                    value={asiloData.nome}
                    error={!!erros.nome}
                    helperText={erros.nome}
                    onChange={(e) => setAsiloData({ ...asiloData, nome: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><DomainOutlinedIcon sx={{ color: "#4fa825" }} /></InputAdornment> }}
                  />
                </Box>
                
                <Box>
                  <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>CNPJ</Typography>
                  <TextField
                    placeholder="00.000.000/0000-00" fullWidth variant="outlined"
                    value={asiloData.cnpj}
                    error={!!erros.cnpj}
                    helperText={erros.cnpj}
                    onChange={(e) => setAsiloData({ ...asiloData, cnpj: mascararCNPJ(e.target.value) })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: "#4fa825" }} /></InputAdornment> }}
                  />
                </Box>
                
                <Box>
                  <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 0.8, ml: 0.5, textAlign: "left" }}>Endereço Completo</Typography>
                  <TextField
                    placeholder="Rua, Número, Bairro, Cidade - UF" fullWidth variant="outlined"
                    value={asiloData.endereco}
                    error={!!erros.endereco}
                    helperText={erros.endereco}
                    onChange={(e) => setAsiloData({ ...asiloData, endereco: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlinedIcon sx={{ color: "#4fa825" }} /></InputAdornment> }}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handleCriarAsilo}
                  disabled={loading}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    mt: 2, bgcolor: "#4fa825", py: 1.5, fontSize: "1.05rem",
                    boxShadow: "0 8px 24px rgba(79,168,37,0.3)",
                    "&:hover": { bgcolor: "#2a5c14", transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(42,92,20,0.4)" }
                  }}
                >
                  {loading ? "Validando..." : "Prosseguir para Gestor"}
                </Button>
              </Box>
            ) : (
              <FormularioCadastroGestor asiloId={asiloId} onFinish={onFinish} />
            )}

            <Typography 
              onClick={onLogout}
              sx={{ 
                mt: 4, color: "#4a6b3b", fontSize: "0.9rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", display: "inline-block",
                "&:hover": { color: "#1a3d0a", textDecoration: "underline" } 
              }}
            >
              Cancelar e Sair do Painel
            </Typography>

          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}