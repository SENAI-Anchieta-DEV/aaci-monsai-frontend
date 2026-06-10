import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, IconButton, Paper, Fade, Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import pulseiraMonsai from '../assets/images/pulseira_monsai.png';

// ─── Tema Local para garantir Tipografia Premium ─────────────────────────────
const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14" },
    secondary: { main: "#4fa825" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  }
});

// ─── Animações CSS Customizadas ──────────────────────────────────────────────
const fadeUp = {
  animation: "fadeUpAnim 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  "@keyframes fadeUpAnim": {
    "0%": { opacity: 0, transform: "translateY(30px)" },
    "100%": { opacity: 1, transform: "translateY(0)" }
  }
};

const floating = {
  animation: "floatAnim 6s ease-in-out infinite",
  "@keyframes floatAnim": {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-12px)" }
  }
};

// ─── Componente Principal ────────────────────────────────────────────────────
export default function Lojinha({ onComprar, onVoltar, onLogin }) {
  const [qty, setQty] = useState(1);

  const features = [
    "Monitoramento Contínuo de Temperatura Corporal",
    "Acelerômetro de Alta Precisão (Detecção de Quedas)",
    "Sensor de Frequência Cardíaca (BPM em tempo real)",
    "Módulo Geolocalizador Avançado (GPS Integrado)"
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box 
        component="main" 
        sx={{ 
          minHeight: "calc(100vh - 64px)", 
          bgcolor: "#c8ddb8", 
          display: "flex", 
          alignItems: "center",
          // Um leve gradiente radial no fundo para dar profundidade
          backgroundImage: "radial-gradient(circle at 50% -20%, #e4f0dc 0%, #c8ddb8 80%)"
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          
          {/* Navegação Superior */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, px: 1, ...fadeUp }}>
            <Button 
              onClick={onVoltar} 
              sx={{ 
                color: "#1a3d0a", fontWeight: 700, fontSize: "0.95rem",
                "&:hover": { bgcolor: "rgba(42, 92, 20, 0.08)", transform: "translateX(-4px)" },
                transition: "all 0.2s"
              }}
            >
              ← Voltar para Home
            </Button>
            {onLogin && (
              <Button 
                onClick={onLogin} 
                variant="outlined" 
                sx={{ 
                  borderColor: "rgba(42, 92, 20, 0.3)", color: "#1a3d0a", 
                  borderRadius: "20px", px: 3,
                  "&:hover": { borderColor: "#2a5c14", bgcolor: "rgba(42, 92, 20, 0.05)" }
                }}
              >
                Acessar Painel
              </Button>
            )}
          </Box>

          {/* Card Principal do Produto */}
          <Fade in={true} timeout={800}>
            <Paper 
              elevation={24} 
              sx={{
                bgcolor: "#ffffff", 
                borderRadius: 4, 
                overflow: "hidden",
                display: "flex", 
                flexDirection: { xs: "column", md: "row" },
                boxShadow: "0 32px 64px -16px rgba(26, 61, 10, 0.2)",
              }}
            >
              
              {/* ── COLUNA ESQUERDA — Imagem Showcase ── */}
              <Box sx={{ 
                flex: "1.2", 
                p: { xs: 4, md: 6 }, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                background: "linear-gradient(145deg, #f4f9f1 0%, #e1ecd8 100%)",
                position: "relative",
              }}>
                <Box sx={{
                  ...floating,
                  width: "100%",
                  maxWidth: 320,
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 30% 30%, #ffffff 0%, rgba(255,255,255,0) 70%)",
                  boxShadow: "0 20px 40px rgba(42, 92, 20, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.6)",
                  backdropFilter: "blur(4px)",
                  mb: 4,
                  overflow: "hidden",
                }}>
                  <Box
                    component="img"
                    src={pulseiraMonsai}
                    alt="Pulseira Monsai"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                </Box>

                {/* Sombra da flutuação */}
                <Box sx={{
                  width: 180, height: 12, borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, rgba(42, 92, 20, 0.2) 0%, rgba(0,0,0,0) 70%)",
                  mt: -2
                }} />
              </Box>

              {/* ── COLUNA DIREITA — Compra e Specs ── */}
              <Box sx={{ 
                flex: "1", 
                p: { xs: 4, md: 6 }, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center" 
              }}>
                
                <Typography sx={{ color: "#4fa825", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "2px", textTransform: "uppercase", mb: 1 }}>
                  Lançamento Exclusivo
                </Typography>
                
                <Typography variant="h3" sx={{ fontWeight: 800, color: "#1a3d0a", mb: 1, letterSpacing: "-1px" }}>
                  Pulseira MONSAI
                </Typography>

                <Typography variant="h4" sx={{ fontWeight: 800, color: "#4fa825", mb: 4 }}>
                  R$ 499,99
                </Typography>

                <Divider sx={{ mb: 4, borderColor: "rgba(42, 92, 20, 0.1)" }} />

                <Typography variant="subtitle1" sx={{ color: "#1a3d0a", fontWeight: 700, mb: 2 }}>
                  Especificações Técnicas
                </Typography>
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 5 }}>
                  <Typography variant="body2" sx={{ color: "#4a6b3b", fontWeight: 600, display: "flex", alignItems: "center" }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4fa825", mr: 1.5 }} />
                    Dimensões: 13 cm² (Compacto e Anatômico)
                  </Typography>
                  {features.map((item, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: "#4a6b3b", fontWeight: 500, display: "flex", alignItems: "center" }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4fa825", mr: 1.5 }} />
                      {item}
                    </Typography>
                  ))}
                </Box>

                {/* Área de Ação (Quantidade + Comprar) */}
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: "auto" }}>
                  
                  {/* Seletor Pill */}
                  <Box sx={{ 
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    bgcolor: "#f4f9f1", border: "1px solid #dbe8d1", borderRadius: "28px", 
                    px: 1, py: 0.5, width: { xs: "100%", sm: 140 }
                  }}>
                    <IconButton 
                      size="small" 
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      sx={{ color: "#2a5c14", '&:hover': { bgcolor: 'rgba(42, 92, 20, 0.1)' } }}
                    >
                      −
                    </IconButton>
                    <Typography sx={{ fontWeight: 700, color: "#1a3d0a", fontSize: "1.1rem" }}>
                      {qty}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setQty((q) => q + 1)}
                      sx={{ color: "#2a5c14", '&:hover': { bgcolor: 'rgba(42, 92, 20, 0.1)' } }}
                    >
                      +
                    </IconButton>
                  </Box>

                  {/* Botão de Compra */}
                  <Button 
                    variant="contained" 
                    onClick={() => onComprar && onComprar(qty)}
                    sx={{ 
                      flex: 1,
                      bgcolor: "#4fa825", 
                      fontSize: "1.1rem", borderRadius: "28px", py: 1.5,
                      boxShadow: "0 8px 20px rgba(79, 168, 37, 0.3)",
                      "&:hover": { 
                        bgcolor: "#2a5c14", 
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 24px rgba(42, 92, 20, 0.4)",
                      },
                      transition: "all 0.3s"
                    }}
                  >
                    Comprar Agora
                  </Button>
                </Box>

              </Box>
            </Paper>
          </Fade>
          
        </Container>
      </Box>
    </ThemeProvider>
  );
}