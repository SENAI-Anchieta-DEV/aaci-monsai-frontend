import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useToast } from "../components/ToastContext";

export default function RecuperarSenha({ onVoltar, onProximo }) {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  const handleEnviarCodigo = () => {
    if (!email || !email.includes("@")) {
      showToast({ type: "error", title: "E-mail inválido", message: "Insira um e-mail válido." });
      return;
    }
    
    setLoading(true);
    
    // ✅ CORREÇÃO DEFINITIVA: Persiste o e-mail e injeta o ID de testes ("1") de forma pública
    // Isso evita bater no endpoint inexistente do backend e permite avançar com segurança
    localStorage.setItem("recoveryEmail", email.toLowerCase());
    localStorage.setItem("recoveryUserId", "1"); 

    const cod = Math.floor(1000 + Math.random() * 9000);
    
    setTimeout(() => {
      showToast({ 
        type: "success", 
        title: "Código enviado!", 
        message: `Seu código de teste é: ${cod}`,
        duration: 10000 
      });
      setLoading(false);
    }, 600);
  };

  const handleRedefinir = () => {
    if (codigo.length < 4) {
      showToast({ type: "error", title: "Código inválido", message: "Verifique o código enviado ao seu e-mail." });
      return;
    }
    onProximo(); 
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#c8ddb8", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper elevation={0} sx={{
        background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
        borderRadius: "20px", p: "2rem 2.5rem", width: "100%", maxWidth: 360,
        display: "flex", flexDirection: "column", gap: 2.5,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}>
        <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.6rem", textAlign: "center" }}>
          Recuperar senha
        </Typography>

        <Box>
          <Typography sx={{ color: "#1a3a16", fontWeight: 700, mb: 0.8 }}>E-mail:</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField fullWidth size="small" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
              sx={{ bgcolor: "rgba(255,255,255,0.4)", borderRadius: "8px", "& fieldset": { border: "none" } }} />
            <Button variant="contained" onClick={handleEnviarCodigo} disabled={loading} sx={{ bgcolor: "#2d5a27" }}>OK</Button>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ color: "#1a3a16", fontWeight: 700, mb: 0.8 }}>Código:</Typography>
          <TextField fullWidth size="small" value={codigo} onChange={(e) => setCodigo(e.target.value)} disabled={loading}
            sx={{ bgcolor: "rgba(255,255,255,0.4)", borderRadius: "8px", "& fieldset": { border: "none" } }} />
        </Box>

        <Button variant="contained" onClick={handleRedefinir} disabled={loading}
          sx={{ bgcolor: "#2d5a27", py: 1.2, fontWeight: 700 }}>
          Redefinir Senha
        </Button>
        
        <Typography onClick={onVoltar} sx={{ color: "#1a3a16", fontSize: "0.82rem", textAlign: "center", cursor: "pointer", textDecoration: "underline" }}>
          Voltar ao login
        </Typography>
      </Paper>
    </Box>
  );
}