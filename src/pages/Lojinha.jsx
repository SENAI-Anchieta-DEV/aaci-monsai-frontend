import { useState } from "react";
import logo from "../assets/logos/Logo_nome.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Toolbar, Box, Button, Container, Typography,
  IconButton, Drawer, List, ListItem, ListItemButton,
  ListItemText, useMediaQuery,
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

const navLinks = ["Voltar ao Home", "Sou Cliente", "Sobre nós", "Contato"];

export default function Lojinha({ onVoltar, onLogin, onComprar }) {
  const [qty, setQty]               = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNav = (link) => {
    setDrawerOpen(false);
    if (link === "Voltar ao Home" && onVoltar) onVoltar();
    if (link === "Sou Cliente"   && onLogin)  onLogin();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>

        {/* ── NAVBAR (padrão Home) ── */}
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
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{
            bgcolor: "#f0f0f0", borderRadius: 3, p: { xs: 3, md: 4 },
            display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4,
          }}>

            {/* Coluna esquerda */}
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

              <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", textAlign: "center" }}>
                Pulseira MONSAI
              </Typography>

              <Typography variant="h5" sx={{ fontWeight: 700, color: "secondary.main", textAlign: "center" }}>
                499,99R$
              </Typography>

              <Button variant="contained" color="secondary"
                onClick={() => onComprar && onComprar(qty)}
                sx={{ px: 5, py: 1, fontSize: "1rem", "&:hover": { bgcolor: "primary.main" } }}>
                Comprar
              </Button>

              {/* Quantidade */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))}
                  sx={{ bgcolor: "#ccc", borderRadius: 1, width: 32, height: 32,
                    fontWeight: 700, "&:hover": { bgcolor: "#bbb" } }}>
                  −
                </IconButton>
                <Typography sx={{ minWidth: 28, textAlign: "center", fontWeight: 600, color: "#333" }}>
                  {qty}
                </Typography>
                <IconButton size="small" onClick={() => setQty((q) => q + 1)}
                  sx={{ bgcolor: "#ccc", borderRadius: 1, width: 32, height: 32,
                    fontWeight: 700, "&:hover": { bgcolor: "#bbb" } }}>
                  +
                </IconButton>
              </Box>
            </Box>

            {/* Coluna direita — descrição */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
              <Typography variant="body1" sx={{ color: "primary.main", fontWeight: 600 }}>
                Descrição da pulseira:<br />
                <Typography component="span" sx={{ fontWeight: 400, color: "#333" }}>13 cm²</Typography>
              </Typography>
              <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.9 }}>
                O produto contém a capacidade de:
                <br />medir temperatura
                <br />acelerômetro
                <br />medir BPM
                <br />GPS
              </Typography>
            </Box>

          </Box>
        </Container>

      </Box>
    </ThemeProvider>
  );
}