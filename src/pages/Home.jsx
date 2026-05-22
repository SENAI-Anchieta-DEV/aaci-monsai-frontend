import { useState, useEffect } from "react";
import logo from "../assets/logos/Logo_nome.png";
import logoCompleta from "../assets/logos/Logo_completa.png";
import idosoFeliz from "../assets/images/idoso_feliz_2.png";
import { useToast } from "../components/ToastContext";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  AppBar, Toolbar, Box, Button, Container, Typography, Grid,
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemText,
  TextField, useMediaQuery,
  Link,
} from "@mui/material";
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import MenuIcon from "@mui/icons-material/Menu";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

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


function ImgPlaceholder({ label, height = 200 }) {
  return (
    <Box sx={{ height, border: "2px dashed #bbb", borderRadius: 2, bgcolor: "#e0e0e0",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography variant="body2" color="text.secondary" fontStyle="italic">{label}</Typography>
    </Box>
  );
}
// ─── COMPONENTE HOME ──────────────────────────────────────────────────────────
export default function Home({ onIrParaLogin, onIrParaLojinha, secaoParaRolar, resetarScroll }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [email, setEmail] = useState("");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showToast = useToast();

  // ── LOGICA DE CORREÇÃO DO BUG-06 ──
  useEffect(() => {
    if (secaoParaRolar) {
      // O timeout de 100ms garante que o DOM já foi renderizado antes de tentar o scroll
      const timer = setTimeout(() => {
        const elemento = document.getElementById(secaoParaRolar);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "start" });
          // Limpa o estado no App.js para que o scroll funcione de novo se clicado
          if (resetarScroll) resetarScroll();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [secaoParaRolar, resetarScroll]);

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
      <Box id="sobre-nos" sx={{ bgcolor: "background.paper", py: { xs: 5, md: 7 } }}>
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
      <Box 
        component="footer"
        id="contato" 
        sx={{ 
          bgcolor: "primary.light", 
          color: "rgba(255,255,255,0.85)",
          py: { xs: 6, md: 8 }, 
          px: { xs: 2, md: 5 } 
        }}
      >
        <Grid container spacing={5} alignItems="flex-start" sx={{ maxWidth: 1100, mx: "auto", mb: 4 }}>

          {/* COLUNA 1: Logo, Descrição e Redes Sociais */}
          <Grid item xs={12} md={4}>
            <Box 
              component="img" 
              src={logo} 
              alt="MONSAI"
              sx={{ height: 40, objectFit: "contain", mb: 2, display: "block" }} 
            />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 3, maxWidth: 280, lineHeight: 1.6 }}>
              Inovação que acompanha cada momento. Siga nossas redes para mais informações.
            </Typography>
            
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {[InstagramIcon, YouTubeIcon, LinkedInIcon].map((Icon, i) => (
                <Box 
                  key={i} 
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", 
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { 
                      bgcolor: "rgba(255,255,255,0.2)",
                      transform: "translateY(-2px)" 
                    },
                  }}
                >
                  <Icon sx={{ fontSize: "1.2rem", color: "white" }} />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* COLUNA 2: Contatos */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 600, mb: 2, letterSpacing: 0.5 }}>
              Fale Conosco
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon sx={{ color: "rgba(255,255,255,0.6)", fontSize: "1.3rem" }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  contato@monsai.com.br
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon sx={{ color: "rgba(255,255,255,0.6)", fontSize: "1.3rem" }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  (11) 3199-9999
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* COLUNA 3: Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 600, mb: 1, letterSpacing: 0.5 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
              Receba atualizações e ofertas exclusivas no seu email.
            </Typography>
            
            <Box sx={{ display: "flex", borderRadius: 1.5, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <TextField 
                size="small" 
                variant="outlined" 
                placeholder="seu@email.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flex: 1, bgcolor: "#fff",
                  "& .MuiOutlinedInput-root": { 
                    borderRadius: 0,
                    "& fieldset": { border: "none" } 
                  },
                  input: { py: "10px", fontSize: "0.9rem", color: "text.primary" },
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleEnviarEmail}
                sx={{ 
                  borderRadius: 0, 
                  px: 3, 
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textTransform: "none",
                  bgcolor: "primary.dark", 
                  "&:hover": { bgcolor: "#0f2606" } 
                }}
              >
                Assinar
              </Button>
            </Box>
          </Grid>

        </Grid>

        {/* LINHA FINAL: Direitos Autorais */}
        <Box sx={{ borderTop: "2px solid rgba(255,255,255,0.1)", pt: 3, mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} MONSAI – Todos os direitos reservados.
          </Typography>
        </Box>
      </Box>

    </ThemeProvider>
  );
};