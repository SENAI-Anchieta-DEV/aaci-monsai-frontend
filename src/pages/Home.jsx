import { useState } from "react";
import logo from "../assets/Logo_nome.png";
import logoCompleta from "../assets/Logo_completa.png";
import idosoFeliz from "../assets/idoso_feliz_2.png";
import { useToast } from "../components/ToastContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Toolbar, Box, Button, Container, Typography, Grid,
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemText,
  TextField, useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// ─── Tema MONSAI ─────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary:  { main: "#4fa825" },
    background: { default: "#ffffff", paper: "#f4f8f0" },
    text:       { primary: "#111111", secondary: "#5a5a5a" },
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
    MuiButton: { styleOverrides: { root: { borderRadius: 28, boxShadow: "none" } } },
  },
});

const navLinks = ["Solicitar adesão", "Sou Cliente", "Sobre nós", "Contato"];

function ImgPlaceholder({ label, height = 200 }) {
  return (
    <Box sx={{ height, border: "2px dashed #bbb", borderRadius: 2, bgcolor: "#e0e0e0",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography variant="body2" color="text.secondary" fontStyle="italic">{label}</Typography>
    </Box>
  );
}

export default function Home({ onIrParaLogin, onIrParaLojinha }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [email, setEmail]           = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showToast = useToast();

  const handleNav = (link) => {
    setDrawerOpen(false);
    if (link === "Sou Cliente")      onIrParaLogin();
    if (link === "Solicitar adesão") onIrParaLojinha();
  };

  const handleEnviarEmail = () => {
    if (!email || !email.includes("@")) {
      showToast({
        type: "error",
        title: "Email inválido",
        message: "Por favor, insira um endereço de email válido.",
      });
      return;
    }
    showToast({
      type: "success",
      title: "Email enviado!",
      message: `Entraremos em contato com ${email} em breve.`,
    });
    setEmail("");
  };

  return (
    <ThemeProvider theme={theme}>

      {/* ── NAVBAR ── */}
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

      {/* ── HERO ── */}
      <Box sx={{
        position: "relative",
        height: { xs: "100svh", md: "600px" },
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}>
        <Box component="img" src={idosoFeliz} alt="Idoso feliz"
          sx={{
            position: "absolute", inset: 0,
            width: "100%", height: { xs: "100%", md: "700px" },
            objectFit: "cover",
            objectPosition: { xs: "27% center", md: "left center" },
          }}
        />

        <Box sx={{
          position: "absolute", inset: 0,
          background: {
            xs: "rgba(0, 0, 0, 0.52)",
            md: "linear-gradient(to right, transparent 40%, #AED696 60%, #AED696 100%)",
          },
        }} />

        <Box sx={{
          position: "relative", zIndex: 1,
          ml: { xs: 0, md: "auto" },
          width: { xs: "100%", md: "50%" },
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 2, p: { xs: 4, md: 6 }, textAlign: "center",
        }}>
          <Box component="img"
            src={logoCompleta}
            alt="MONSAI"
            sx={{
              width: { xs: "260px", md: "400px" },
              objectFit: "contain",
              filter: { xs: "brightness(0) invert(1)", md: "none" },
            }}
          />

          <Typography variant="h5" sx={{
            display: { xs: "none", md: "block" },
            color: "#1a3d0a", fontStyle: "italic", fontWeight: 600,
            lineHeight: 1.6, fontSize: "40px",
          }}>
            " O monitoramento<br />que protege vidas."
          </Typography>
        </Box>
      </Box>

      {/* ── SOBRE / PRODUTO ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" gutterBottom>Conheça o MONSAI</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            Tecnologia que cuida, segurança que tranquiliza.
          </Typography>
          <Typography variant="body1" color="text.secondary"
            sx={{ maxWidth: 720, mx: "auto", lineHeight: 1.8 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut quam tristique,
            pul vinar eros eu, commodo libero. Aenean ullamcorper maximus augue eu iaculis.
            Pellentesque sed efficitur elit. Sed ultricies, nulla nec eleifend faucibus,
            lorem lectus blandit velit, at vehicula neque tempus ex. Suspendisse potenti.
          </Typography>
        </Box>

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
          <Typography variant="h5" sx={{ mb: 4 }}>Conheça a equipe:</Typography>

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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: "auto" }}>
          Nunca foi tão fácil garantir segurança, autonomia e tranquilidade para toda a família.
        </Typography>
        <Button variant="contained" color="secondary"
          onClick={() => onIrParaLojinha()}
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

          <Grid item xs={12} md={4}>
            <Typography variant="body2"
              sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 700, mb: 1, letterSpacing: 0.5 }}>
              Email:
            </Typography>
            <Box sx={{ display: "flex", borderRadius: 1, overflow: "hidden" }}>
              <TextField size="small" variant="outlined" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flex: 1, bgcolor: "#fff",
                  "& .MuiOutlinedInput-root": { borderRadius: 0,
                    "& fieldset": { border: "none" } },
                  input: { py: "9px", fontSize: "0.88rem" },
                }}
              />
              <Button variant="contained" color="primary"
                onClick={handleEnviarEmail}
                sx={{ borderRadius: 0, px: 2, fontSize: "0.8rem",
                  bgcolor: "primary.dark", "&:hover": { bgcolor: "#0f2606" } }}>
                Enviar
              </Button>
            </Box>
          </Grid>

        </Grid>

        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.15)", pt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
            © 2024 MONSAI – Todos os direitos reservados.
          </Typography>
        </Box>
      </Box>

    </ThemeProvider>
  );
}