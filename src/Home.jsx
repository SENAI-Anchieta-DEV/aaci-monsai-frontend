import { useState } from "react";
import logo from "./assets/Logo_nome.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  Typography,
  Grid,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// ─── Tema MONSAI ─────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:   { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary: { main: "#4fa825" },
    background:{ default: "#ffffff", paper: "#f4f8f0" },
    text:      { primary: "#111111", secondary: "#5a5a5a" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    h1: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    subtitle1: { fontFamily: "'Montserrat', sans-serif", fontWeight: 500 },
    body1:     { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    button:    { fontFamily: "'Montserrat', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 28, boxShadow: "none" },
      },
    },
  },
});

// ─── Nav links ────────────────────────────────────────────────────────────────
const navLinks = ["Entenda o alarme", "Sua Cliente", "Sobre nós", "Contato"];

// ─── Placeholder de imagem ────────────────────────────────────────────────────
function ImgPlaceholder({ label, height = 200 }) {
  return (
    <Box
      sx={{
        height,
        border: "2px dashed #bbb",
        borderRadius: 2,
        bgcolor: "#e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        {label}
      </Typography>
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MonsaiHome() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [email, setEmail]           = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <ThemeProvider theme={theme}>

      {/* ── NAVBAR ── */}
      <AppBar position="sticky" sx={{ bgcolor: "primary.main", boxShadow: "none" }}>
        <Toolbar sx={{ px: { xs: 2, md: 5 }, justifyContent: "space-between" }}>

          {/* Logo */}
          <Box component="img" src={logo} alt="MONSAI"
            sx={{ height: 40, objectFit: "contain" }}
          />

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {navLinks.map((link) => (
                <Button key={link} sx={{ color: "rgba(255,255,255,0.88)", fontSize: "0.85rem",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}>
                  {link}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#fff" }}>
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
                <ListItemButton onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary={link} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* ── HERO ── */}
      <Box sx={{ bgcolor: "primary.main", display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, minHeight: 340 }}>

        {/* Lado esquerdo — foto */}
        <Box sx={{ bgcolor: "#3d6b1c", display: "flex", alignItems: "center",
          justifyContent: "center", minHeight: { xs: 200, md: "auto" }, fontSize: "4rem" }}>
          👴🏼
        </Box>

        {/* Lado direito — brand */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 2, p: { xs: 4, md: 5 }, textAlign: "center" }}>
          <Box sx={{ width: 80, height: 80, borderRadius: "50%", fontSize: "2.5rem",
            bgcolor: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            🌳
          </Box>
          <Typography variant="h3" sx={{ color: "#fff", letterSpacing: 2 }}>
            MONSAI
          </Typography>
          <Typography variant="subtitle1" sx={{
            color: "rgba(255,255,255,0.85)", fontStyle: "italic",
            borderLeft: "3px solid", borderColor: "primary.light",
            pl: 2, textAlign: "left", lineHeight: 1.6,
          }}>
            "O monitoramento<br />que protege vidas."
          </Typography>
        </Box>
      </Box>

      {/* ── SOBRE / PRODUTO ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>

        {/* Header da seção */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" gutterBottom>
            Conheça o MONSAI
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            Tecnologia que cuida, segurança que tranquiliza.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mx: "auto", lineHeight: 1.8 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut quam tristique,
            pul vinar eros eu, commodo libero. Aenean ullamcorper maximus augue eu iaculis.
            Pellentesque sed efficitur elit. Sed ultricies, nulla nec eleifend faucibus,
            lorem lectus blandit velit, at vehicula neque tempus ex. Suspendisse potenti.
          </Typography>
        </Box>

        {/* Texto + foto do produto */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut quam tristique,
              pul vinar eros eu, commodo libero. Aenean ullamcorper maximus augue eu iaculis.
              Pellentesque sed efficitur elit.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mt: 2 }}>
              Sed ultricies, nulla nec eleifend faucibus, lorem lectus blandit velit,
              at vehicula neque tempus ex. Suspendisse potenti.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <ImgPlaceholder label="foto do produto" height={220} />
          </Grid>
        </Grid>
      </Container>

      {/* ── EQUIPE ── */}
      <Box sx={{ bgcolor: "background.paper", py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h5" sx={{ mb: 4 }}>
            Conheça a equipe:
          </Typography>

          {/* Membro 1 — foto esquerda */}
          <Grid container spacing={4} alignItems="center" sx={{ mb: 5 }}>
            <Grid item xs={12} md={4}>
              <ImgPlaceholder label="foto da equipe" height={180} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut quam tristique,
                pul vinar eros eu, commodo libero. Aenean ullamcorper maximus augue eu iaculis.
                Pellentesque sed efficitur elit.
              </Typography>
            </Grid>
          </Grid>

          {/* Membro 2 — foto direita */}
          <Grid container spacing={4} alignItems="center" direction={{ xs: "column", md: "row" }}>
            <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut quam tristique,
                pul vinar eros eu, commodo libero. Aenean ullamcorper maximus augue eu iaculis.
                Pellentesque sed efficitur elit.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} order={{ xs: 1, md: 2 }}>
              <ImgPlaceholder label="foto da equipe 2" height={180} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 6, md: 8 }, textAlign: "center", px: 2 }}>
        <Typography variant="h4" gutterBottom>
          Proteção Inteligente para Quem Você Ama
        </Typography>
        <Typography variant="body1" color="text.secondary"
          sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
          Nunca foi tão fácil garantir segurança, autonomia e tranquilidade para toda a família.
        </Typography>
        <Button variant="contained" color="secondary"
          sx={{ px: 4, py: 1.5, fontSize: "0.95rem", borderRadius: "28px",
            boxShadow: "0 4px 14px rgba(79,168,37,0.35)",
            "&:hover": { bgcolor: "primary.main" } }}>
          Quero Solicitar<br />Minha Adesão Agora
        </Button>
      </Box>

      {/* ── FOOTER ── */}
      <Box component="footer" sx={{ bgcolor: "primary.main", color: "rgba(255,255,255,0.85)",
        py: { xs: 4, md: 5 }, px: { xs: 2, md: 5 } }}>
        <Grid container spacing={4} alignItems="flex-start" sx={{ maxWidth: 1000, mx: "auto", mb: 3 }}>

          {/* Brand + social */}
          <Grid item xs={12} md="auto">
            <Box component="img" src={logo} alt="MONSAI"
              sx={{ height: 36, objectFit: "contain", mb: 1.5, display: "block" }} />
            <Box sx={{ display: "flex", gap: 1 }}>
              {["📷", "🐦", "💼", "👥"].map((icon, i) => (
                <Box key={i} sx={{
                  width: 32, height: 32, borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: "1rem",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}>
                  {icon}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contato */}
          <Grid item xs={12} md>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>✉️</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  email: monsai@gmail
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>📞</Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  Telefone: 11(XXX)31xxxx
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Email newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="body2"
              sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 700, mb: 1, letterSpacing: 0.5 }}>
              Email:
            </Typography>
            <Box sx={{ display: "flex", borderRadius: 1, overflow: "hidden" }}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flex: 1,
                  bgcolor: "#fff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    "& fieldset": { border: "none" },
                  },
                  input: { py: "9px", fontSize: "0.88rem" },
                }}
              />
              <Button variant="contained" color="primary"
                onClick={() => { alert(`Enviado: ${email}`); setEmail(""); }}
                sx={{ borderRadius: 0, px: 2, fontSize: "0.8rem",
                  bgcolor: "primary.dark", "&:hover": { bgcolor: "#0f2606" } }}>
                Enviar
              </Button>
            </Box>
          </Grid>

        </Grid>

        {/* Bottom */}
        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.15)", pt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
            © 2024 MONSAI – Todos os direitos reservados.
          </Typography>
        </Box>
      </Box>

    </ThemeProvider>
  );
}