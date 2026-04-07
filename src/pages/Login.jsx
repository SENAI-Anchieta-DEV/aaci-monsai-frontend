import { useState } from "react";
import axios from "axios";
import logo from "../assets/Logo_nome.png";
import { useToast } from "../components/ToastContext"; // Vindo do código dele

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, TextField, Typography, Paper,
  AppBar, Toolbar, IconButton, Drawer, List,
  ListItem, ListItemButton, ListItemText, useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary: { main: "#4fa825" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    button: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 28, boxShadow: "none" } } },
  },
});

const NAV_LINKS = ["Voltar ao Home", "Sobre nós", "Contato"];

const PERFIS = [
  { id: "administrador", label: "Administrador" },
  { id: "gestor",         label: "Gestor" },
  { id: "cuidador",       label: "Cuidador" },
  { id: "enfermeira",     label: "Enfermeira" },
  { id: "familiar",       label: "Familiar" },
];

function PersonIcon({ active }) {
  const color = active ? "#fff" : "#2d5a27";
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <circle cx="18" cy="11" r="6" fill={color} />
      <path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12"
        stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Barra de carregamento estilizada vinda do código dele
function LoadingBar() {
  return (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
    }}>
      <Box sx={{ bgcolor: "#e8e8e8", borderRadius: "16px", px: 3, py: 2.5, width: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, mb: 1.2, color: "#1a1a1a" }}>
          Carregando...
        </Typography>
        <Box sx={{ width: "100%", height: 18, bgcolor: "#d0d0d0", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
          <Box sx={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "100%",
            background: "linear-gradient(to right, #2a5c14 0%, #4fa825 55%, #d0d0d0 100%)",
            animation: "loadingSlide 1.6s ease-in-out infinite",
            "@keyframes loadingSlide": { "0%": { transform: "translateX(-100%)" }, "50%": { transform: "translateX(0%)" }, "100%": { transform: "translateX(100%)" } },
          }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function Login({ onLogin, onVoltar, onRecuperar }) {
  const [selectedRole, setSelectedRole] = useState("gestor");
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showToast = useToast();

  const handleNav = (link) => {
    setDrawerOpen(false);
    if (link === "Voltar ao Home" && onVoltar) onVoltar();
  };

  // FUSÃO: Sua lógica de busca de usuário + Toasts/Loading dele
  const handleLogin = async () => {
    if (!credential || !password) {
      showToast({ type: "error", title: "Campos vazios", message: "Preencha email e senha." });
      return;
    }

    setLoading(true);
    try {
      // 1. Sua chamada de autenticação
      const { data: { token, tipoPerfil } } = await axios.post("http://localhost:8080/auth/login", {
        email: credential,
        senha: password,
      });

      // 2. Sua busca de dados complementares
      const { data: listaUsuarios } = await axios.get("http://localhost:8080/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuarioLogado = listaUsuarios.find(
        (u) => u.email.toLowerCase() === credential.toLowerCase()
      );

      if (!usuarioLogado) {
        showToast({ type: "error", title: "Erro de Perfil", message: "Não encontramos seus dados de acesso." });
        setLoading(false);
        return;
      }

      // 3. Montagem do seu pacote completo para o App.js
      const pacoteCompleto = {
        token,
        tipoPerfil,
        asiloId: usuarioLogado.asilo?.id,
        usuarioId: usuarioLogado.id,
        nome: usuarioLogado.nome,
        email: usuarioLogado.email,
        cpf: usuarioLogado.cpf,
      };

      showToast({ type: "success", title: "Bem-vindo!", message: `Olá, ${usuarioLogado.nome}!` });
      
      onLogin(pacoteCompleto);

    } catch (error) {
      console.error("Erro de autenticação:", error);
      const msg = error.response?.data?.message || "Email ou senha incorretos.";
      showToast({ type: "error", title: "Falha no Login", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {loading && <LoadingBar />}
      <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#c8ddb8", display: "flex", flexDirection: "column" }}>
        
        {/* NAVBAR */}
        <AppBar component="header" position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
          <Toolbar sx={{ px: { xs: 2, md: 5 }, justifyContent: "space-between" }}>
            <Box component="img" src={logo} alt="MONSAI" sx={{ height: 40, objectFit: "contain" }} />
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {NAV_LINKS.map((link) => (
                  <Button key={link} onClick={() => handleNav(link)} sx={{ color: "#1a3d0a", fontWeight: 600 }}>
                    {link}
                  </Button>
                ))}
              </Box>
            )}
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#1a3d0a" }}><MenuIcon /></IconButton>
            )}
          </Toolbar>
        </AppBar>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 220, pt: 2 }}>
            <List>
              {NAV_LINKS.map((link) => (
                <ListItem key={link} disablePadding>
                  <ListItemButton onClick={() => handleNav(link)}><ListItemText primary={link} /></ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* FORMULÁRIO */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            
            {/* Seletor de Perfis (Sua lógica visual) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {PERFIS.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <Button key={role.id} onClick={() => setSelectedRole(role.id)} variant="contained"
                    sx={{
                      bgcolor: active ? "#2d5a27" : "#8ec86a", color: active ? "#fff" : "#1e3d1a",
                      flexDirection: "column", width: 90, py: 1, borderRadius: "12px", fontSize: "0.72rem",
                      transform: active ? "scale(1.06)" : "scale(1)", transition: "all 0.2s"
                    }}>
                    <PersonIcon active={active} />
                    {role.label}
                  </Button>
                );
              })}
            </Box>

            {/* Card de Login */}
            <Paper elevation={0} sx={{
              background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
              borderRadius: "20px", p: "2rem 2.5rem", width: 320, display: "flex", flexDirection: "column", gap: 2.5
            }}>
              <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700 }}>Login:</Typography>
              
              <Box>
                <Typography sx={{ color: "#1a3a16", fontWeight: 700, mb: 0.8 }}>Email / CPF:</Typography>
                <TextField fullWidth size="small" value={credential} onChange={(e) => setCredential(e.target.value)}
                  sx={{ bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px", "& fieldset": { border: "none" } }} />
              </Box>

              <Box>
                <Typography sx={{ color: "#1a3a16", fontWeight: 700, mb: 0.8 }}>Senha:</Typography>
                <TextField fullWidth size="small" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  sx={{ bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px", "& fieldset": { border: "none" } }} />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Button variant="contained" onClick={handleLogin} disabled={loading}
                  sx={{ bgcolor: "#2d5a27", color: "#fff", px: 4, fontWeight: 700 }}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Typography onClick={() => onRecuperar?.()}
                  sx={{ color: "#1a3a16", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline" }}>
                  Recuperar senha?
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}