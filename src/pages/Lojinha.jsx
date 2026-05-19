import { useState } from "react";
import { Box, Button, Container, Typography, IconButton } from "@mui/material";

export default function Lojinha({ onComprar }) {
  const [qty, setQty] = useState(1);
import { Box, Button, Container, Typography, IconButton } from "@mui/material";

export default function Lojinha({ onComprar }) {
  const [qty, setQty] = useState(1);

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#c8ddb8", display: "flex", alignItems: "center" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{
          bgcolor: "#CCE5C1", borderRadius: 3, p: { xs: 3, md: 4 },
          display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        }}>

          {/* Coluna esquerda - Imagem e Compra */}
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
          {/* Coluna esquerda - Imagem e Compra */}
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2a5c14", textAlign: "center" }}>
              Pulseira MONSAI
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4fa825", textAlign: "center" }}>
              499,99R$
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4fa825", textAlign: "center" }}>
              499,99R$
            </Typography>

            <Button 
              variant="contained" 
              onClick={() => onComprar && onComprar(qty)}
              sx={{ 
                bgcolor: "#4fa825", 
                px: 5, py: 1, fontSize: "1rem", borderRadius: 28,
                textTransform: "none", fontWeight: 600,
                "&:hover": { bgcolor: "#2a5c14" } 
              }}
            >
              Comprar
            </Button>
            <Button 
              variant="contained" 
              onClick={() => onComprar && onComprar(qty)}
              sx={{ 
                bgcolor: "#4fa825", 
                px: 5, py: 1, fontSize: "1rem", borderRadius: 28,
                textTransform: "none", fontWeight: 600,
                "&:hover": { bgcolor: "#2a5c14" } 
              }}
            >
              Comprar
            </Button>

            {/* Controle de Quantidade */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))}
                sx={{ bgcolor: "#ccc", borderRadius: 1, width: 32, height: 32 }}>
                −
              </IconButton>
              <Typography sx={{ minWidth: 28, textAlign: "center", fontWeight: 600, color: "#333" }}>
                {qty}
              </Typography>
              <IconButton size="small" onClick={() => setQty((q) => q + 1)}
                sx={{ bgcolor: "#ccc", borderRadius: 1, width: 32, height: 32 }}>
                +
              </IconButton>
            </Box>
          </Box>
            {/* Controle de Quantidade */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))}
                sx={{ bgcolor: "#ccc", borderRadius: 1, width: 32, height: 32 }}>
                −
              </IconButton>
              <Typography sx={{ minWidth: 28, textAlign: "center", fontWeight: 600, color: "#333" }}>
                {qty}
              </Typography>
              <IconButton size="small" onClick={() => setQty((q) => q + 1)}
                sx={{ bgcolor: "#ccc", borderRadius: 1, width: 32, height: 32 }}>
                +
              </IconButton>
            </Box>
          </Box>

          {/* Coluna direita — Descrição */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ color: "#2a5c14", fontWeight: 600 }}>
              Descrição da pulseira:<br />
              <Typography component="span" sx={{ fontWeight: 400, color: "#333" }}>13 cm²</Typography>
            </Typography>
            <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.9 }}>
              O produto contém a capacidade de:
              <br />• medir temperatura
              <br />• acelerômetro
              <br />• medir BPM
              <br />• GPS
            </Typography>
          </Box>
          
        </Box>
      </Container>
    </Box>
          {/* Coluna direita — Descrição */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ color: "#2a5c14", fontWeight: 600 }}>
              Descrição da pulseira:<br />
              <Typography component="span" sx={{ fontWeight: 400, color: "#333" }}>13 cm²</Typography>
            </Typography>
            <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.9 }}>
              O produto contém a capacidade de:
              <br />• medir temperatura
              <br />• acelerômetro
              <br />• medir BPM
              <br />• GPS
            </Typography>
          </Box>
          
        </Box>
      </Container>
    </Box>
  );
}