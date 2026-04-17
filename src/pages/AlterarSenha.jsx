import { useState } from "react";
import { 
  Box, Button, TextField, Typography, Paper, 
  AppBar, Toolbar, IconButton, useMediaQuery 
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import logo from "../assets/logos/Logo_nome.png";
import { useToast } from "../components/ToastContext";
import api from "utils/api";

const theme = createTheme({
  palette: {
    primary: { main: "#2a5c14" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
  }
});

export default function AlterarSenha({ onSucesso, onVoltar }) {
  const [novaSenha, setNovaSenha]           = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading]               = useState(false);
  const showToast = useToast();
  const validarSenha = (senha) => {
  if (!senha) return "A senha não pode estar vazia.";
  if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  // Se quiser ser mais rigoroso, pode adicionar regras de números/símbolos aqui
  return null; // Retorna null se estiver tudo ok
};
 
  const handleFinalizar = async () => {
    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) { showToast({ type: "error", title: "Senha inválida", message: erroSenha }); return; }
    if (novaSenha !== confirmarSenha) {
      showToast({ type: "error", title: "Senhas diferentes", message: "A confirmação não coincide." });
      return;
    }
 
    // ✅ Endpoint correto: PATCH /usuarios/{id}/senha
    // O id vem do localStorage — salvo pelo Login após autenticação
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
      showToast({ type: "error", title: "Sessão inválida", message: "Faça login novamente." });
      return;
    }
 
    setLoading(true);
    try {
      await api.patch(`/usuarios/${usuarioId}/senha`, { novaSenha });
 
      showToast({ type: "success", title: "Senha alterada!", message: "Sua nova senha está ativa. Faça login." });
      localStorage.removeItem("recoveryEmail");
      onSucesso();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.detail || "Não foi possível alterar a senha.";
      showToast({ type: "error", title: "Erro ao alterar senha", message: msg });
    } finally {
      setLoading(false);
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#c8ddb8", display: "flex", flexDirection: "column" }}>
        
        {/* Navbar */}
        <AppBar position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
          <Toolbar sx={{ px: { xs: 2, md: 5 } }}>
            <Box component="img" src={logo} alt="MONSAI" sx={{ height: 40 }} />
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Paper elevation={0} sx={{
            background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
            borderRadius: "20px", p: "2rem 2.5rem", width: 320,
            display: "flex", flexDirection: "column", gap: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            textAlign: "center"
          }}>
            <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.9rem" }}>
              Alterar a senha
            </Typography>

            <Typography sx={{ color: "#1a3a16", fontSize: "0.9rem", fontWeight: 500 }}>
              Insira sua nova senha.
            </Typography>

            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.1rem", mb: 0.8 }}>
                Senha:
              </Typography>
              <TextField 
                fullWidth variant="outlined" size="small" type="password"
                value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
                sx={{
                  bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px",
                  "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" } },
                }}
              />
            </Box>

            <Button variant="contained" onClick={handleFinalizar}
              sx={{
                bgcolor: "#2d5a27", color: "#fff", borderRadius: "10px",
                py: 1.2, fontWeight: 700, fontSize: "1rem",
                "&:hover": { bgcolor: "#1e3d1a" }
              }}>
              Redefinir
            </Button>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}