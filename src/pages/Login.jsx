import { useState } from "react";
import { useToast } from "../components/ToastContext";
import api from "../utils/api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { 
  Box, Button, TextField, Typography, Paper, InputAdornment, IconButton 
} from "@mui/material";

// Importando os ícones para dar um ar profissional aos inputs
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Importando a logo para reforçar a marca na tela de login
import logoCompleta from "../assets/logos/Logo_completa.png";

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
    }
  },
});

function LoadingBar() {
  return (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: "rgba(10, 26, 5, 0.4)", backdropFilter: "blur(6px)",
      animation: "fadeIn 0.3s ease-out"
    }}>
      <Box sx={{ 
        bgcolor: "#ffffff", borderRadius: "20px", px: 4, py: 3.5, width: 320, 
        boxShadow: "0 24px 48px rgba(0,0,0,0.3)", textAlign: "center" 
      }}>
        <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, mb: 2, color: "#1a3d0a", fontSize: "1.1rem" }}>
          Autenticando...
        </Typography>
        <Box sx={{ width: "100%", height: 6, bgcolor: "#e4f0dc", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
          <Box sx={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "50%",
            background: "linear-gradient(to right, #7ec44f 0%, #2a5c14 100%)",
            borderRadius: "999px",
            animation: "loadingSlide 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            "@keyframes loadingSlide": {
              "0%":   { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(200%)" },
            },
          }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function Login({ onLogin, onRecuperar }) {
  const [credential, setCredential] = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Novo state para o "olhinho" da senha
  const showToast = useToast();

  const handleLogin = async () => {
    if (!credential || !password) {
      showToast({ type: "error", title: "Campos vazios", message: "Preencha email e senha para continuar." });
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ 1. Faz o POST inicial e captura TODA a resposta do Backend (Token + Dados do Usuário)
      const responseAuth = await api.post("/auth/login", {
        email: credential,
        senha: password,
      });

      const dados = responseAuth.data;

      // ✅ 2. Monta o objeto de sessão lendo direto do DTO retornado, SEM chamar /usuarios
      const dadosSessao = {
        token: dados.token || dados.accessToken,
        tipoPerfil: dados.tipoPerfil || "",
        usuarioId: dados.usuarioId ? String(dados.usuarioId) : "",
        asiloId: dados.asiloId ? String(dados.asiloId) : "",
        nome: dados.nome || "Usuário",
        email: credential,
        cpf: dados.cpf || ""
      };

      // ✅ 3. Grava no localStorage para consistência e persistência imediata
      localStorage.setItem("token",        dadosSessao.token);
      localStorage.setItem("tipoPerfil",   dadosSessao.tipoPerfil);
      localStorage.setItem("usuarioId",    dadosSessao.usuarioId);
      localStorage.setItem("asiloId",      dadosSessao.asiloId);
      localStorage.setItem("nomeUsuario",  dadosSessao.nome);
      localStorage.setItem("emailUsuario", dadosSessao.email);
      localStorage.setItem("cpfUsuario",   dadosSessao.cpf);

      showToast({ type: "success", title: "Bem-vindo!", message: `Olá, ${dadosSessao.nome}!` });
      
      // ✅ 4. Envia o objeto populado para o App.js realizar a mudança de tela
      onLogin(dadosSessao);

    } catch (error) {
      localStorage.removeItem("token");
      
      // Ajuste para capturar 401 ou 403 de forma genérica como erro de credencial
      const msg = error.response?.status === 401 || error.response?.status === 403 
        ? "Email ou senha incorretos."
        : (error.response?.data?.message || "Erro de autorização ao entrar. Tente novamente.");
        
      showToast({ type: "error", title: "Falha no Login", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {loading && <LoadingBar />}
      
      {/* Container Principal com Background Premium */}
      <Box 
        component="div" 
        sx={{ 
          minHeight: "calc(100vh - 64px)", 
          // Fundo com mesh gradient usando a sua paleta
          background: "radial-gradient(circle at 15% 50%, #e4f0dc 0%, #c8ddb8 50%, #a8d58a 100%)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          p: { xs: 2, md: 3 },
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Círculo decorativo de fundo (Efeito de luz sutil) */}
        <Box sx={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(126,196,79,0.3) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
        
        {/* Card de Login com Glassmorphism */}
        <Paper 
          elevation={0} 
          sx={{ 
            background: "rgba(255, 255, 255, 0.85)", 
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            borderRadius: "24px", 
            p: { xs: "2.5rem 1.5rem", sm: "3.5rem 3rem" }, 
            width: "100%", 
            maxWidth: 440, 
            display: "flex", 
            flexDirection: "column", 
            gap: 3.5, 
            boxShadow: "0 24px 48px -12px rgba(26, 61, 10, 0.2)",
            position: "relative",
            zIndex: 1,
            animation: "monsai-modalIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            "@keyframes monsai-modalIn": {
              from: { opacity: 0, transform: "scale(0.96) translateY(20px)" },
              to: { opacity: 1, transform: "scale(1) translateY(0)" }
            }
          }}
        >
          {/* Cabeçalho do Card */}
          <Box sx={{ textAlign: "center", mb: 1 }}>
            {/* Logo MONSAI renderizada se existir no path, senão cai pro fallback gracefully */}
            <Box component="img" src={logoCompleta} alt="MONSAI Logo" sx={{ width: 180, mx: "auto", mb: 3, display: "block", filter: "drop-shadow(0 4px 6px rgba(42,92,20,0.1))" }} onError={(e) => e.target.style.display = 'none'} />
            
            <Typography variant="h4" sx={{ color: "#1a3d0a", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Bem-vindo
            </Typography>
            <Typography variant="body2" sx={{ color: "#4a6b3b", fontWeight: 500, mt: 0.5, fontSize: "0.95rem" }}>
              Acesse o painel de monitoramento
            </Typography>
          </Box>

          {/* Área de Inputs */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 1, ml: 0.5 }}>E-mail</Typography>
              <TextField 
                fullWidth 
                placeholder="seu@email.com"
                variant="outlined" 
                value={credential} 
                onChange={(e) => setCredential(e.target.value)} 
                disabled={loading} 
                autoComplete="username" 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "#4fa825", fontSize: "1.3rem" }} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ color: "#1a3d0a", fontWeight: 700, fontSize: "0.9rem", mb: 1, ml: 0.5 }}>Senha</Typography>
              <TextField 
                fullWidth 
                placeholder="••••••••"
                variant="outlined" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={loading} 
                autoComplete="current-password" 
                onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()} 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#4fa825", fontSize: "1.3rem" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff sx={{ color: "#4a6b3b", fontSize: "1.2rem" }} /> : <Visibility sx={{ color: "#4a6b3b", fontSize: "1.2rem" }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>

          {/* Área de Ações */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
            <Button 
              variant="contained" 
              onClick={handleLogin} 
              disabled={loading} 
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                bgcolor: "#4fa825", 
                color: "#fff", 
                py: 1.4, 
                fontSize: "1.05rem", 
                width: "100%", 
                boxShadow: "0 8px 24px rgba(79,168,37,0.3)", 
                "&:hover": { 
                  bgcolor: "#2a5c14",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(42,92,20,0.4)" 
                } 
              }}
            >
              Entrar no Sistema
            </Button>
            
            <Typography 
              onClick={() => !loading && onRecuperar?.()} 
              sx={{ 
                color: "#4a6b3b", 
                fontSize: "0.9rem", 
                fontWeight: 600,
                cursor: "pointer", 
                transition: "all 0.2s",
                "&:hover": { color: "#1a3d0a", textDecoration: "underline" } 
              }}
            >
              Esqueceu sua senha?
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}