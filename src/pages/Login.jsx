import { useState } from "react";
import axios from "axios";
import { useToast } from "../components/ToastContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, TextField, Typography, Paper
} from "@mui/material";

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

function LoadingBar() {
  return (
    <Box sx={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
    }}>
      <Box sx={{ bgcolor: "#e8e8e8", borderRadius: "16px", px: 3, py: 2.5, width: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <Typography sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, mb: 1.2, color: "#1a1a1a" }}>
          Carregando...
        </Typography>
        <Box sx={{ width: "100%", height: 18, bgcolor: "#d0d0d0", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
          <Box sx={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "100%",
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

export default function Login({ onLogin, onRecuperar }) {
  const [credential, setCredential]     = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);

  const showToast = useToast();

  const handleLogin = async () => {
    if (!credential || !password) {
      showToast({ type: "error", title: "Campos vazios", message: "Preencha email e senha." });
      return;
    }
    setLoading(true);
    try {
      const { data: { token, tipoPerfil } } = await axios.post("http://localhost:8080/auth/login", {
        email: credential,
        senha: password,
      });

      const { data: listaUsuarios } = await axios.get("http://localhost:8080/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuarioLogado = listaUsuarios.find(
        (u) => u.email.toLowerCase() === credential.toLowerCase()
      );

      if (!usuarioLogado) {
        showToast({ type: "error", title: "Erro de Perfil", message: "Não encontramos seus dados de acesso." });
        return;
      }

      showToast({ type: "success", title: "Bem-vindo!", message: `Olá, ${usuarioLogado.nome}!` });
      onLogin({ 
        token, tipoPerfil, asiloId: usuarioLogado.asilo?.id, usuarioId: usuarioLogado.id,
        nome: usuarioLogado.nome, email: usuarioLogado.email, cpf: usuarioLogado.cpf 
      });

    } catch (error) {
      const msg = error.response?.data?.message || "Email ou senha incorretos.";
      showToast({ type: "error", title: "Falha no Login", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {loading && <LoadingBar />}

      {/* Removida a AppBar local: agora o App.js gerencia a Navbar global */}
      <Box component="div" sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#c8ddb8", display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
            borderRadius: "20px",
            p: { xs: "2rem", sm: "2.5rem 3rem" },
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700, textAlign: "center", mb: 1 }}>
            Login
          </Typography>

          <Box>
            <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1rem", mb: 0.8, fontFamily: "'Inter', sans-serif" }}>
              Email / CPF:
            </Typography>
            <TextField fullWidth variant="outlined" size="small"
              value={credential} onChange={(e) => setCredential(e.target.value)}
              disabled={loading} autoComplete="username"
              sx={{
                bgcolor: "rgba(255,255,255,0.4)", borderRadius: "8px",
                "& .MuiOutlinedInput-root": { borderRadius: "8px", "& fieldset": { border: "none" } },
                input: { color: "#1a3d0a" },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1rem", mb: 0.8, fontFamily: "'Inter', sans-serif" }}>
              Senha:
            </Typography>
            <TextField fullWidth variant="outlined" size="small" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={loading} autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
              sx={{
                bgcolor: "rgba(255,255,255,0.4)", borderRadius: "8px",
                "& .MuiOutlinedInput-root": { borderRadius: "8px", "& fieldset": { border: "none" } },
                input: { color: "#1a3d0a" },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Button variant="contained" onClick={handleLogin} disabled={loading}
              sx={{
                bgcolor: "#2d5a27", color: "#fff", borderRadius: "8px",
                py: 1.2, fontWeight: 700, fontSize: "1rem", width: "100%",
                boxShadow: "0 4px 14px rgba(45,90,39,0.4)",
                "&:hover": { bgcolor: "#1e3d1a" },
              }}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <Typography onClick={() => !loading && onRecuperar?.()}
              sx={{ color: "#1a3a16", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", opacity: 0.8, "&:hover": { opacity: 1 } }}>
              Esqueceu sua senha?
            </Typography>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}