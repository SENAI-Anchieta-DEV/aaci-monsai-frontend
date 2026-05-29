import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, IconButton 
} from '@mui/material';

// ─── Componente de Apresentação e Compra da Lojinha ─────────────────────────
export default function Lojinha({ onComprar, onVoltar, onLogin }) {
  const [qty, setQty] = useState(1);

  return (
    <Box 
      component="main" 
      sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#c8ddb8", display: "flex", alignItems: "center" }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        
        {/* Barra superior de navegação local da Lojinha */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: 1 }}>
          <Button onClick={onVoltar} sx={{ color: "#2a5c14", fontWeight: 600, textTransform: "none", fontSize: "0.95rem" }}>
            ← Voltar para Home
          </Button>
          {onLogin && (
            <Button onClick={onLogin} variant="outlined" sx={{ borderColor: "#2a5c14", color: "#2a5c14", textTransform: "none", borderRadius: 28, fontWeight: 600 }}>
              Acessar Painel
            </Button>
          )}
        </Box>

        <Box sx={{
          bgcolor: "#CCE5C1", borderRadius: 3, p: { xs: 3, md: 4 },
          display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}>

          {/* Coluna Esquerda — Imagem e Compra */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1 }}>
            <Box sx={{
              width: "100%", maxWidth: 220, aspectRatio: "1",
              border: "2px dashed #aaa", borderRadius: 2, bgcolor: "#ddd",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Typography variant="body2" fontStyle="italic" sx={{ color: "#888" }}>
                foto do produto
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2a5c14", textAlign: "center" }}>
              Pulseira MONSAI
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4fa825", textAlign: "center" }}>
              R$ 499,99
            </Typography>

            {/* Controle de Quantidade */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                sx={{ bgcolor: "#b0cf9f", borderRadius: 1, width: 32, height: 32, '&:hover': { bgcolor: '#9ec28b' } }}
              >
                −
              </IconButton>
              <Typography sx={{ minWidth: 28, textAlign: "center", fontWeight: 600, color: "#333", fontSize: "1.1rem" }}>
                {qty}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setQty((q) => q + 1)}
                sx={{ bgcolor: "#b0cf9f", borderRadius: 1, width: 32, height: 32, '&:hover': { bgcolor: '#9ec28b' } }}
              >
                +
              </IconButton>
            </Box>

            <Button 
              variant="contained" 
              onClick={() => onComprar && onComprar(qty)}
              sx={{ 
                bgcolor: "#4fa825", 
                px: 6, py: 1.2, fontSize: "1rem", borderRadius: 28,
                textTransform: "none", fontWeight: 600, boxShadow: "none",
                "&:hover": { bgcolor: "#2a5c14" } 
              }}
            >
              Comprar Agora
            </Button>
          </Box>

          {/* Coluna Direita — Descrição Técnica */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ color: "#2a5c14", fontWeight: 700, borderBottom: "1px solid #b0cf9f", pb: 1 }}>
              Especificações Técnicas
            </Typography>
            
            <Typography variant="body1" sx={{ color: "#2a5c14", fontWeight: 600 }}>
              Dimensões do Dispositivo: <br />
              <Typography component="span" sx={{ fontWeight: 400, color: "#333" }}>13 cm² (Compacto e Anatômico)</Typography>
            </Typography>

            <Typography variant="body1" sx={{ color: "#2a5c14", fontWeight: 600, mb: 1 }}>
              O produto contém a capacidade de:
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}>
              <Typography variant="body2" sx={{ color: "#333", display: "flex", alignItems: "center" }}>
                • Monitoramento Contínuo de Temperatura Corporal
              </Typography>
              <Typography variant="body2" sx={{ color: "#333", display: "flex", alignItems: "center" }}>
                • Acelerômetro de Alta Precision (Detecção de Quedas Bruscas)
              </Typography>
              <Typography variant="body2" sx={{ color: "#333", display: "flex", alignItems: "center" }}>
                • Sensor de Frequência Cardíaca (BPM em tempo real)
              </Typography>
              <Typography variant="body2" sx={{ color: "#333", display: "flex", alignItems: "center" }}>
                • Módulo Geolocalizador Avançado (GPS Integrado)
              </Typography>
            </Box>
          </Box>
          
        </Box>
      </Container>
    </Box>
  );
}