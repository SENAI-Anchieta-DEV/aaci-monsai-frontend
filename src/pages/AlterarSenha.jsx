import { useState } from "react";
import { useToast } from "../components/ToastContext";
import api from "../utils/api";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Button, TextField, Typography, Paper, AppBar, Toolbar } from "@mui/material";
import logo from "../assets/logos/Logo_nome.png";
import { useToast } from "../components/ToastContext";
import api from "../utils/api";

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
    return null;
  };
 
  const handleFinalizar = async () => {
    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) { 
      showToast({ type: "error", title: "Senha inválida", message: erroSenha }); 
      return; 
    }
    
    if (novaSenha !== confirmarSenha) {
      showToast({ type: "error", title: "Senhas diferentes", message: "A confirmação de senha não coincide." });
      return;
    }
 
    const usuarioId = localStorage.getItem("usuarioId");
    if (!usuarioId) {
      showToast({ type: "error", title: "Sessão inválida", message: "Identificação do usuário perdida. Faça login novamente." });
      return;
    }
 
    setLoading(true);
    try {
      await api.patch(`/usuarios/${usuarioId}/senha`, { novaSenha });
 
      showToast({ type: "success", title: "Senha alterada!", message: "Sua nova senha está ativa. Faça login." });
      localStorage.removeItem("recoveryEmail");
      
      setTimeout(() => {
        onSucesso();
      }, 1000);
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
            <Box component="img" src={logo} alt="MONSAI" sx={{ height: 40, cursor: 'pointer' }} onClick={onVoltar} />
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Paper elevation={0} sx={{
            background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
            borderRadius: "20px", p: "2rem 2.5rem", width: 340,
            display: "flex", flexDirection: "column", gap: 2.5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            textAlign: "center"
          }}>
            <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.9rem" }}>
              Alterar a senha
            </Typography>

            <Typography variant="body2" sx={{ color: "#1a3a16", opacity: 0.9, fontWeight: 500 }}>
              Insira e confirme sua nova credencial de acesso.
            </Typography>

            <Box sx={{ textAlign: "left", display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>
                  Nova Senha:
                </Typography>
                <TextField 
                  fullWidth variant="outlined" size="small" type="password"
                  value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
                  disabled={loading}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.4)", borderRadius: "8px",
                    "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" } },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}>
                  Confirmar Nova Senha:
                </Typography>
                <TextField 
                  fullWidth variant="outlined" size="small" type="password"
                  value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleFinalizar()}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.4)", borderRadius: "8px",
                    "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" } },
                  }}
                />
              </Box>
            </Box>

            <Button 
              variant="contained" 
              onClick={handleFinalizar}
              disabled={loading}
              sx={{
                bgcolor: "#2d5a27", color: "#fff", borderRadius: "8px",
                py: 1.2, fontWeight: 700, fontSize: "1rem", mt: 1,
                "&:hover": { bgcolor: "#1e3d1a" }
              }}
            >
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}