import { useState } from "react";
import { Box, Typography, TextField, Button, IconButton, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "../assets/Logo_nome.png";
import { useToast } from "./ToastContext";

export default function RecuperarSenha({ onVoltar }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const showToast = useToast();

  const handleEnviarCodigo = () => {
    if (!email.includes("@")) {
      showToast({ type: "error", title: "Email inválido", message: "Insira um email real para receber o código." });
      return;
    }
    showToast({ type: "success", title: "Código enviado!", message: "Verifique sua caixa de entrada (e o spam)." });
  };

  const handleRedefinir = () => {
    if (codigo.length < 4) {
      showToast({ type: "error", title: "Código incompleto", message: "O código deve ter pelo menos 4 dígitos." });
      return;
    }
    showToast({ type: "success", title: "Senha redefinida!", message: "Você já pode fazer login com sua nova senha temporária." });
    onVoltar(); // Volta para a tela de login
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      bgcolor: "#f4f7f2", // Fundo levemente esverdeado/cinza
      p: 2 
    }}>
      
      {/* Botão Voltar */}
      <IconButton 
        onClick={onVoltar} 
        sx={{ position: "absolute", top: 20, left: 20, color: "#1a3d0a" }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Logo */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box component="img" src={logo} alt="MONSAI" sx={{ height: 60, mb: 1 }} />
        <Typography sx={{ color: "#2a5c14", fontSize: "0.85rem", fontWeight: 600, letterSpacing: 0.5 }}>
          Monitoramento Integrado de Saúde do Idoso
        </Typography>
      </Box>

      {/* Card de Recuperação (com o gradiente da imagem) */}
      <Paper elevation={4} sx={{
        width: "100%",
        maxWidth: 500,
        borderRadius: "20px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a4025 0%, #c5e1b5 100%)", // Gradiente verde escuro para claro
        p: { xs: 3, md: 5 },
        textAlign: "center"
      }}>
        <Typography variant="h4" sx={{ color: "#0a4025", fontWeight: 800, mb: 3 }}>
          Recuperar senha
        </Typography>

        <Typography sx={{ color: "#0a4025", fontWeight: 600, fontSize: "0.95rem", mb: 4, lineHeight: 1.3 }}>
          Insira seu email, enviaremos um código<br />pra você recuperar a senha
        </Typography>

        {/* Campo Email + Botão Enviar */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          bgcolor: "#0a4025", 
          borderRadius: "15px", 
          p: 0.8, 
          mb: 3 
        }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, px: 2, fontSize: "1.1rem" }}>
            Email:
          </Typography>
          <TextField 
            variant="standard"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ 
              disableUnderline: true,
              sx: { bgcolor: "#fff", borderRadius: "10px", px: 1.5, height: 35 } 
            }}
          />
          <Button 
            onClick={handleEnviarCodigo}
            sx={{ 
              color: "#0a4025", 
              bgcolor: "#66bb4a", 
              fontWeight: 800, 
              ml: 1, 
              borderRadius: "10px",
              px: 3,
              "&:hover": { bgcolor: "#55a03d" }
            }}
          >
            Enviar
          </Button>
        </Box>

        {/* Campo Código */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          bgcolor: "#0a4025", 
          borderRadius: "15px", 
          p: 0.8, 
          mb: 6,
          width: "80%",
          mr: "auto"
        }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, px: 2, fontSize: "1.1rem" }}>
            Codigo:
          </Typography>
          <TextField 
            variant="standard"
            fullWidth
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            InputProps={{ 
              disableUnderline: true,
              sx: { bgcolor: "#fff", borderRadius: "10px", px: 1.5, height: 35 } 
            }}
          />
        </Box>

        {/* Botão Redefinir */}
        <Button 
          onClick={handleRedefinir}
          variant="contained"
          sx={{ 
            bgcolor: "#66bb4a", 
            color: "#0a4025", 
            fontWeight: 800, 
            fontSize: "1.2rem",
            px: 6,
            py: 1,
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            "&:hover": { bgcolor: "#55a03d" }
          }}
        >
          Redefinir
        </Button>
      </Paper>
    </Box>
  );
}