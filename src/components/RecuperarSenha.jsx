import { useState } from "react";
import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../assets/Logo_nome.png";
import { useToast } from "./ToastContext";

// ─── Tema MONSAI ──────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary: { main: "#4fa825" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    // Títulos — Inter Bold 700
    h4: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    // Subtítulos/Slogans — Montserrat Medium 500
    subtitle1: { fontFamily: "'Montserrat', sans-serif", fontWeight: 500 },
    // Corpo — Inter Regular 400
    body1: { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    body2: { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    // Botões/Destaques — Montserrat Semibold 600
    button: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, boxShadow: "none" } } },
  },
});

export default function RecuperarSenha({ onVoltar }) {
  const [email,  setEmail]  = useState("");
  const [codigo, setCodigo] = useState("");
  const showToast = useToast();

  const handleEnviarCodigo = () => {
    if (!email || !email.includes("@")) {
      showToast({
        type: "error",
        title: "Email inválido",
        message: "Insira um email válido para receber o código.",
      });
      return;
    }
    showToast({
      type: "success",
      title: "Código enviado!",
      message: "Verifique sua caixa de entrada (e o spam).",
    });
  };

  const handleRedefinir = () => {
    if (codigo.length < 4) {
      showToast({
        type: "error",
        title: "Código incompleto",
        message: "O código deve ter pelo menos 4 dígitos.",
      });
      return;
    }
    showToast({
      type: "success",
      title: "Senha redefinida!",
      message: "Você já pode fazer login com sua nova senha.",
    });
    onVoltar();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: "100vh",
        bgcolor: "#c8ddb8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
      }}>

        {/* Botão voltar */}
        <IconButton onClick={onVoltar}
          sx={{ position: "absolute", top: 20, left: 20, color: "#AED696" }}>
          <ArrowBackIcon />
        </IconButton>

        {/* Logo */}
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Box component="img" src={logo} alt="MONSAI"
            sx={{ height: 56, objectFit: "contain", display: "block", mx: "auto", mb: 0.5 }} />
          <Typography variant="body2" sx={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: "0.75rem",
            letterSpacing: 0.5,
          }}>
            Monitoramento Integrado de Saúde do Idoso
          </Typography>
        </Box>

        {/* Card */}
        <Box sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(160deg, #3d8c1e 0%, #AED696 100%)",
          p: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2.5,
        }}>

          {/* Título — Inter Bold 700 */}
          <Typography variant="h4" sx={{
            color: "#1a3d0a",
            textAlign: "center",
            fontSize: "1.9rem",
          }}>
            Recuperar senha
          </Typography>

          {/* Instrução — Inter Regular 400 */}
          <Typography variant="body1" sx={{
            color: "#1a3d0a",
            textAlign: "center",
            fontSize: "0.92rem",
            lineHeight: 1.5,
            px: 1,
          }}>
            Insira seu email, enviaremos um código<br />
            pra você recuperar a senha
          </Typography>

          {/* Campo Email + botão Enviar */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#1a3d0a",
            borderRadius: "12px",
            px: 1.5, py: 0.8,
            width: "100%",
            gap: 1,
          }}>
            {/* Label — Montserrat Semibold 600 */}
            <Typography sx={{
              color: "#fff",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              minWidth: 52,
            }}>
              Email:
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnviarCodigo()}
              autoComplete="email"
              InputProps={{
                disableUnderline: true,
                sx: {
                  bgcolor: "#4fa825",
                  borderRadius: "8px",
                  px: 1.5,
                  height: 34,
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                },
              }}
            />
            <Button onClick={handleEnviarCodigo}
              sx={{
                color: "#1a3d0a",
                bgcolor: "#AED696",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                py: 0.6,
                whiteSpace: "nowrap",
                fontSize: "0.85rem",
                "&:hover": { bgcolor: "#7ec44f" },
              }}>
              Enviar
            </Button>
          </Box>

          {/* Campo Código */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#1a3d0a",
            borderRadius: "12px",
            px: 1.5, py: 0.8,
            width: "80%",
            alignSelf: "flex-start",
            gap: 1,
          }}>
            {/* Label — Montserrat Semibold 600 */}
            <Typography sx={{
              color: "#fff",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              minWidth: 60,
            }}>
              Codigo:
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRedefinir()}
              InputProps={{
                disableUnderline: true,
                sx: {
                  bgcolor: "#4fa825",
                  borderRadius: "8px",
                  px: 1.5,
                  height: 34,
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.9rem",
                },
              }}
            />
          </Box>

          {/* Botão Redefinir — Montserrat Semibold 600 */}
          <Button
            onClick={handleRedefinir}
            variant="contained"
            sx={{
              mt: 1,
              bgcolor: "#4fa825",
              color: "#1a3d0a",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              px: 6,
              py: 1,
              borderRadius: "10px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
              "&:hover": { bgcolor: "#3d8c1e" },
            }}>
            Redefinir
          </Button>

        </Box>
      </Box>
    </ThemeProvider>
  );
}