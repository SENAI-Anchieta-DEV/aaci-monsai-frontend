import { useState } from "react";
import axios from "axios";
import logo from "../assets/Logo_nome.png";
import { useToast } from "../components/ToastContext";

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

const navLinks = ["Voltar ao Home", "Sobre nós", "Contato"];

const roles = [
  { id: "administrador", label: "Administrador" },
  { id: "gestor",        label: "Gestor" },
  { id: "cuidador",      label: "Cuidador" },
  { id: "enfermeira",    label: "Enfermeira" },
  { id: "familiar",      label: "Familiar" },
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

// ─── Barra de carregamento ────────────────────────────────────────────────────
function LoadingBar() {
  return (
    <Box sx={{
      position: "fixed",
      inset: 0,
      zIndex: 9998,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(2px)",
    }}>
      <Box sx={{
        bgcolor: "#e8e8e8",
        borderRadius: "16px",
        px: 3,
        py: 2.5,
        width: 340,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}>
        {/* Texto Carregando... — Inter Bold 700 */}
        <Typography sx={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          color: "#1a1a1a",
          mb: 1.2,
        }}>
          Carregando...
        </Typography>

        {/* Trilha da barra */}
        <Box sx={{
          width: "100%",
          height: 18,
          bgcolor: "#d0d0d0",
          borderRadius: "999px",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Barra animada com gradiente verde */}
          <Box sx={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "100%",
            background: "linear-gradient(to right, #2a5c14 0%, #4fa825 55%, #d0d0d0 100%)",
            borderRadius: "999px",
            animation: "loadingSlide 1.6s ease-in-out infinite",
            "@keyframes loadingSlide": {
              "0%":   { transform: "translateX(-100%)" },
              "50%":  { transform: "translateX(0%)" },
              "100%": { transform: "translateX(100%)" },
            },
          }} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Login({ onLogin, onVoltar, onRecuperar }) {
  const [selectedRole, setSelectedRole] = useState("gestor");
  const [credential, setCredential]     = useState("");
  const [password, setPassword]         = useState("");
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showToast = useToast();

  const handleNav = (link) => {
    setDrawerOpen(false);
    if (link === "Voltar ao Home" && onVoltar) onVoltar();
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email: credential,
        senha: password,
      });
      const { token } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      showToast({
        type: "success",
        title: "Conteúdo Acessado!",
        message: "Login bem-sucedido.",
      });

      onLogin();
    } catch (error) {
      console.error("Erro de autenticação:", error);
      showToast({
        type: "error",
        title: "Falha no login!",
        message: "O Email ou Senha inseridos estão incorretos.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>

      {/* Barra de carregamento — aparece só durante o request */}
      {loading && <LoadingBar />}

      <Box sx={{ minHeight: "100vh", bgcolor: "#c8ddb8", display: "flex", flexDirection: "column" }}>

        {/* ── NAVBAR ── */}
        <AppBar position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
          <Toolbar sx={{ px: { xs: 2, md: 5 }, justifyContent: "space-between" }}>
            <Box component="img" src={logo} alt="MONSAI" sx={{ height: 40, objectFit: "contain" }} />

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {navLinks.map((link) => (
                  <Button key={link} onClick={() => handleNav(link)}
                    sx={{ color: "#1a3d0a", fontWeight: 600, fontSize: "0.85rem",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.08)" } }}>
                    {link}
                  </Button>
                ))}
              </Box>
            )}

            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#1a3d0a" }}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 220, pt: 2 }}>
            <List>
              {navLinks.map((link) => (
                <ListItem key={link} disablePadding>
                  <ListItemButton onClick={() => handleNav(link)}>
                    <ListItemText primary={link} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* ── CONTEÚDO ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", p: 2 }}>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

            {/* Seletor de perfil */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {roles.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <Button key={role.id} onClick={() => setSelectedRole(role.id)}
                    variant="contained" disabled={loading}
                    sx={{
                      bgcolor: active ? "#2d5a27" : "#8ec86a",
                      color: active ? "#fff" : "#1e3d1a",
                      flexDirection: "column", gap: 0.3,
                      width: 90, py: 1, borderRadius: "12px",
                      fontSize: "0.72rem", fontWeight: active ? 700 : 500,
                      boxShadow: active ? "0 4px 14px rgba(45,90,39,0.4)" : "0 2px 6px rgba(0,0,0,0.12)",
                      transform: active ? "scale(1.06)" : "scale(1)",
                      transition: "all 0.2s",
                      "&:hover": { bgcolor: active ? "#245020" : "#7db85c" },
                    }}>
                    <PersonIcon active={active} />
                    {role.label}
                  </Button>
                );
              })}
            </Box>

            {/* Card de login */}
            <Paper elevation={0} sx={{
              background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
              borderRadius: "20px", p: "2rem 2.5rem", width: 320,
              display: "flex", flexDirection: "column", gap: 2.5,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}>
              <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700, textAlign: "left" }}>
                Login:
              </Typography>

              <Box>
                <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.1rem", mb: 0.8,
                  fontFamily: "'Inter', sans-serif" }}>
                  Email / CPF:
                </Typography>
                <TextField fullWidth variant="outlined" size="small"
                  value={credential} onChange={(e) => setCredential(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  sx={{
                    bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px",
                    "& .MuiOutlinedInput-root": { borderRadius: "8px",
                      "& fieldset": { border: "none" } },
                    input: { color: "#1e3d1a" },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.1rem", mb: 0.8,
                  fontFamily: "'Inter', sans-serif" }}>
                  Senha:
                </Typography>
                <TextField fullWidth variant="outlined" size="small" type="password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
                  sx={{
                    bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px",
                    "& .MuiOutlinedInput-root": { borderRadius: "8px",
                      "& fieldset": { border: "none" } },
                    input: { color: "#1e3d1a" },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Button variant="contained" onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    bgcolor: "#2d5a27", color: "#fff", borderRadius: "8px",
                    px: 4, py: 0.9, fontWeight: 700, fontSize: "0.95rem",
                    boxShadow: "0 4px 14px rgba(45,90,39,0.4)",
                    "&:hover": { bgcolor: "#1e3d1a" },
                    "&.Mui-disabled": { bgcolor: "#5a8a3a", color: "rgba(255,255,255,0.6)" },
                  }}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Typography onClick={() => !loading && onRecuperar?.()}
                  sx={{ color: "#1a3a16", fontSize: "0.82rem",
                    cursor: loading ? "default" : "pointer",
                    textDecoration: "underline", opacity: loading ? 0.4 : 0.8,
                    "&:hover": { opacity: loading ? 0.4 : 1 } }}>
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