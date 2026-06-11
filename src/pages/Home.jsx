import { useState, useEffect, useRef } from "react";
import logo from "../assets/logos/Logo_nome.png";
import logoCompleta from "../assets/logos/Logo_completa.png";
import idosoFeliz from "../assets/images/idoso_feliz_2.png";
import { useToast } from "../components/ToastContext";
import pulseiraMonsai from "../assets/images/pulseira_monsai.png";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box, Button, Container, Typography, Grid, TextField,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShieldIcon from "@mui/icons-material/Shield";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DevicesIcon from "@mui/icons-material/Devices";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";

// ─── Tema MONSAI ──────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary:    { main: "#2a5c14", dark: "#1a3d0a", light: "#7ec44f" },
    secondary:  { main: "#4fa825" },
    background: { default: "#ffffff", paper: "#f4f9f1" },
    text:       { primary: "#111111", secondary: "#4a6b3b" },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    h1: { fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: "-1.5px" },
    h2: { fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: "-1px" },
    h3: { fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: "-0.5px" },
    h4: { fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: "-0.5px" },
    h5: { fontFamily: "'Inter', sans-serif", fontWeight: 700 },
    subtitle1: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    body1:     { fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.7 },
    button:    { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "none", letterSpacing: "0.5px" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 14px 0 rgba(42, 92, 20, 0.15)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(42, 92, 20, 0.25)" },
        },
      },
    },
  },
});

// ─── CSS Global ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes monsai-heroIn {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes monsai-ecgDraw {
    from { stroke-dashoffset: 900; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes monsai-pulseRing {
    0%   { transform: scale(0.7); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes monsai-modalIn {
    from { opacity: 0; transform: scale(.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes monsai-backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .monsai-hero-content {
    animation: monsai-heroIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }
  .monsai-ecg-path {
    stroke-dasharray: 900;
    stroke-dashoffset: 900;
    animation: monsai-ecgDraw 2.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
  }

  /*
    Reveal — aplicado num wrapper <div> puro, NUNCA no elemento que
    precisa de position:absolute, translate(-50%,-50%) ou display:flex centralizado.
    O wrapper só controla opacity + translateY, sem interferir no layout filho.
  */
  .monsai-reveal-wrap {
    opacity: 0;
    transform: translateY(40px);
    transition:
      opacity  0.8s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .monsai-reveal-wrap.d1 { transition-delay: 0.10s; }
  .monsai-reveal-wrap.d2 { transition-delay: 0.20s; }
  .monsai-reveal-wrap.d3 { transition-delay: 0.30s; }
  .monsai-reveal-wrap.d4 { transition-delay: 0.40s; }
  .monsai-reveal-wrap.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Feature card hover */
  .monsai-fcard {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    position: relative;
    overflow: hidden;
  }
  .monsai-fcard:hover {
    transform: translateY(-8px) !important;
    box-shadow: 0 24px 48px -12px rgba(42,92,20,.22) !important;
  }

  /* Play hover — só scale, sem translate para não conflitar */
  .monsai-play-wrap {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .monsai-video-thumb:hover .monsai-play-wrap {
    transform: scale(1.12);
  }
  .monsai-video-thumb:hover .monsai-thumb-overlay {
    background: rgba(0,0,0,0.2) !important;
  }

  /* Social hover */
  .monsai-social { transition: background .2s, transform .2s; }
  .monsai-social:hover { background: rgba(255,255,255,.18) !important; transform: translateY(-4px); }

  /* Modal */
  .monsai-modal-backdrop { animation: monsai-backdropIn .35s ease forwards; }
  .monsai-modal-box      { animation: monsai-modalIn .45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  /* Features grid */
  .monsai-features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
  @media (max-width: 1024px) { .monsai-features-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px)  { .monsai-features-grid { grid-template-columns: 1fr; } }

  @media (prefers-reduced-motion: reduce) {
    .monsai-hero-content, .monsai-ecg-path { animation: none !important; stroke-dashoffset: 0 !important; }
    .monsai-reveal-wrap, .monsai-reveal-wrap.visible { opacity: 1 !important; transform: none !important; transition: none !important; }
    .monsai-fcard:hover { transform: none !important; }
  }
`;

function injectGlobalCSS() {
  const id = "monsai-styles-v4";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id; s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
  }
}

// ─── Hook reveal ─────────────────────────────────────────────────────────────
// Retorna uma ref para um <div> wrapper simples.
// NUNCA coloque essa ref num elemento que usa position:absolute ou translate para centralizar.
function useReveal(delayClass = "") {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("monsai-reveal-wrap");
    if (delayClass) el.classList.add(delayClass);
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayClass]);
  return ref;
}

// ─── ECG decorativo ──────────────────────────────────────────────────────────
function EcgLine({ stroke = "rgba(42,92,20,.6)" }) {
  return (
    <Box sx={{ width: "100%", lineHeight: 0, my: 1 }}>
      <svg viewBox="0 0 900 50" preserveAspectRatio="none"
        style={{ width: "100%", height: 42, display: "block" }}>
        <path className="monsai-ecg-path"
          d="M0,25 L130,25 L155,25 L170,5 L185,46 L200,7 L215,42 L230,25 L280,25 L310,25 L325,11 L340,40 L355,14 L370,37 L385,25 L440,25 L900,25"
          fill="none" stroke={stroke} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, delayClass }) {
  const ref = useReveal(delayClass);
  return (
    // wrapper de reveal — só controla fade/slide
    <div ref={ref}>
      <div className="monsai-fcard" style={{
        height: "280px",
        background: "linear-gradient(145deg, #ffffff 0%, #fcfdfa 100%)",
        borderRadius: "20px",
        border: "1px solid rgba(200,221,184,0.45)",
        boxShadow: "0 10px 30px -10px rgba(42,92,20,.08)",
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        justifyContent: "flex-start", textAlign: "left", gap: "16px",
        padding: "32px 24px", boxSizing: "border-box",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "14px",
          background: "linear-gradient(135deg, #e8f5da 0%, #c4e89a 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 16px rgba(126,196,79,.2)",
          marginBottom: "8px", flexShrink: 0,
        }}>
          <span style={{ color: "#1a3d0a", display: "flex", fontSize: "1.6rem" }}>{icon}</span>
        </div>
        <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1a3d0a", lineHeight: 1.3, margin: 0 }}>{title}</p>
        <p style={{ fontSize: "0.88rem", color: "#4a6b3b", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Modal de vídeo ───────────────────────────────────────────────────────────
function VideoModal({ open, onClose, videoUrl }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\s]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    return url;
  };

  return (
    <Box className="monsai-modal-backdrop" onClick={onClose} sx={{
      position: "fixed", inset: 0, zIndex: 1400,
      bgcolor: "rgba(10,26,5,.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      p: { xs: 2, md: 4 },
    }}>
      <Box className="monsai-modal-box" onClick={(e) => e.stopPropagation()} sx={{
        position: "relative", width: "100%", maxWidth: 1000,
        borderRadius: 4, overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,.8)",
        bgcolor: "#000", aspectRatio: "16/9",
        border: "1px solid rgba(255,255,255,.1)",
      }}>
        <Box onClick={onClose} sx={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          width: 40, height: 40, borderRadius: "50%",
          bgcolor: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all .2s",
          "&:hover": { bgcolor: "rgba(0,0,0,.9)", transform: "scale(1.1)" },
        }}>
          <CloseIcon sx={{ color: "white", fontSize: "1.2rem" }} />
        </Box>

        {videoUrl ? (
          <iframe src={getEmbedUrl(videoUrl)} title="MONSAI — Apresentação"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        ) : (
          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0a1a05" }}>
            <Typography sx={{ color: "rgba(255,255,255,.4)", fontSize: ".9rem" }}>
              Substitua <code style={{ color: "#7ec44f" }}>PITCH_VIDEO_URL</code> pela URL do vídeo
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
export default function Home({ onIrParaLojinha, secaoParaRolar, resetarScroll }) {
  const [email, setEmail] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const showToast = useToast();

  const PITCH_VIDEO_URL = "https://youtu.be/x3YrmDOuvug";

  useEffect(() => { injectGlobalCSS(); }, []);

  useEffect(() => {
    if (!secaoParaRolar) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(secaoParaRolar);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); resetarScroll?.(); }
    }, 150);
    return () => clearTimeout(timer);
  }, [secaoParaRolar, resetarScroll]);

  const handleEnviarEmail = () => {
    if (!email || !email.includes("@")) {
      return showToast({ type: "error", title: "Email inválido", message: "Insira um endereço de email válido." });
    }
    showToast({ type: "success", title: "Inscrito!", message: "Obrigado por acompanhar o MONSAI." });
    setEmail("");
  };

  // Refs — cada um aponta para um <div> wrapper neutro
  const secaoTituloRef  = useReveal();
  const pitchRef        = useReveal();
  const pitchTextRef    = useReveal("d2");
  const produtoTituloRef = useReveal();
  const produtoTextoRef  = useReveal("d2");
  const produtoImgRef    = useReveal("d3");
  const equipeTituloRef  = useReveal();
  const equipeImgRef     = useReveal("d1");
  const equipeTextoRef   = useReveal("d2");
  const ctaBlocoRef      = useReveal();

  const features = [
    { icon: <FavoriteIcon />,            title: "Monitoramento em tempo real", description: "Sensores avançados que acompanham cada batimento e variação de temperatura de forma contínua.", delayClass: "d1" },
    { icon: <NotificationsActiveIcon />, title: "Alertas imediatos",           description: "Sistema inteligente que notifica cuidadores no exato momento de uma queda ou anomalia vital.", delayClass: "d2" },
    { icon: <ShieldIcon />,              title: "Privacidade absoluta",        description: "Infraestrutura blindada que garante a segurança dos dados médicos através de criptografia JWT.", delayClass: "d3" },
    { icon: <DevicesIcon />,             title: "Painel centralizado",         description: "Controle total da saúde do paciente através de um dashboard intuitivo para qualquer dispositivo.", delayClass: "d4" },
  ];

  return (
    <ThemeProvider theme={theme}>

      {/* ═══════════ HERO ═══════════════════════════════════════════════════ */}
      <Box sx={{
        position: "relative",
        height: { xs: "100svh", md: "80vh" },
        minHeight: 600,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}>
        <Box component="img" src={idosoFeliz} alt="Idoso feliz" sx={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: { xs: "center", md: "left center" },
        }} />

        <Box sx={{
          position: "absolute", inset: 0,
          background: {
            xs: "rgba(10,26,5,.6)",
            md: "linear-gradient(to right, rgba(10,26,5,.08) 0%, rgba(10,26,5,.45) 38%, rgba(200,221,184,.95) 68%, #e4f0dc 100%)",
          },
        }} />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-end", height: "100%" }}>
          <Box className="monsai-hero-content" sx={{
            width: { xs: "100%", md: "50%", lg: "45%" },
            height: "100%",
            display: "flex", flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
            p: { xs: 4, md: 8 },
          }}>
            <Box component="img" src={logoCompleta} alt="MONSAI" sx={{
              width: { xs: "280px", md: "420px" },
              objectFit: "contain", mb: 2,
              filter: {
                xs: "brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,.3))",
                md: "drop-shadow(0 4px 12px rgba(42,92,20,.2))",
              },
            }} />

            <Box sx={{ display: { xs: "none", md: "block" }, width: "100%", mb: 2 }}>
              <EcgLine stroke="#2a5c14" />
            </Box>

            <Typography variant="h4" sx={{
              display: { xs: "none", md: "block" },
              color: "#1a3d0a", mb: 4,
              lineHeight: 1.4, letterSpacing: "-0.5px",
            }}>
              A tecnologia que cuida,<br />a segurança que tranquiliza.
            </Typography>

            <Button variant="contained" color="secondary" onClick={() => onIrParaLojinha()}
              sx={{
                px: 5, py: 1.8, fontSize: "1.05rem", mt: { xs: 4, md: 0 },
                boxShadow: "0 8px 24px rgba(79,168,37,.4)",
                "&:hover": { bgcolor: "#2a5c14" },
              }}>
              Conheça o Produto
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ═══════════ FEATURES ════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: "background.paper", py: { xs: 8, md: 12 }, borderTop: "1px solid rgba(42,92,20,.1)" }}>
        <Container maxWidth="lg">
          <div ref={secaoTituloRef} style={{ textAlign: "center", marginBottom: 48 }}>
            <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 800, letterSpacing: "2.5px" }}>
              O Ecossistema MONSAI
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, color: "#1a3d0a" }}>
              Engenharia a favor da vida
            </Typography>
          </div>
          <div className="monsai-features-grid">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </Container>
      </Box>

      {/* ═══════════ VÍDEO / APRESENTAÇÃO ════════════════════════════════════ */}
      <Box sx={{ bgcolor: "#0a1a05", py: { xs: 10, md: 14 }, px: 2, position: "relative", overflow: "hidden" }}>
        {/* Brilho decorativo de fundo */}
        <Box sx={{
          position: "absolute", top: "20%", left: "-8%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(126,196,79,.1) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">

            {/* Texto */}
            <Grid item xs={12} md={5}>
              <div ref={pitchRef}>
                <Typography variant="overline" sx={{ color: "#7ec44f", fontWeight: 800, letterSpacing: "2px" }}>
                  Nossa apresentação
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, mb: 3, color: "#ffffff" }}>
                  A história por trás<br />do nosso hardware.
                </Typography>
              </div>
              <div ref={pitchTextRef}>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,.7)", fontSize: "1.05rem", lineHeight: 1.85, mb: 3 }}>
                  Entenda o problema real que nos motivou e como desenvolvemos do zero uma pulseira
                  capaz de ler batimentos, temperatura e quedas com resposta instantânea de telemetria.
                </Typography>
                <Button variant="outlined" onClick={() => setVideoOpen(true)}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    borderColor: "#7ec44f", color: "#7ec44f", px: 3.5, py: 1.3,
                    "&:hover": { borderColor: "#fff", color: "#fff", bgcolor: "rgba(255,255,255,.06)" },
                  }}>
                  Veja nossa apresentação
                </Button>
              </div>
            </Grid>

            {/* Thumbnail do vídeo
                ─ O Grid item é só um posicionador (display:flex, centralizado).
                ─ O Box clicável NÃO recebe nenhum ref de reveal — evita conflito de transform.
                ─ O botão play usa position:absolute + top/left 50% + translate(-50%,-50%)
                  isolado dentro do Box, sem interferência do reveal.           */}
            <Grid item xs={12} md={7} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              {/* Wrapper de reveal — só controla fade/slide, não tem position nem flex */}
              <div ref={useReveal("d2")} style={{ width: "100%" }}>
                <Box
                  className="monsai-video-thumb"
                  onClick={() => setVideoOpen(true)}
                  sx={{
                    position: "relative",
                    width: "100%", maxWidth: 580,
                    mx: "auto",                     // centraliza o maxWidth
                    borderRadius: 4, overflow: "hidden",
                    aspectRatio: "16/9",
                    border: "1px solid rgba(126,196,79,.2)",
                    cursor: "pointer",
                    boxShadow: "0 32px 80px rgba(0,0,0,.55)",
                    bgcolor: "#122a0c",
                  }}
                >
                  {/* Fundo com ECG */}
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
                    <EcgLine stroke="rgba(126,196,79,.3)" />
                  </Box>

                  {/* Grade decorativa */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .06 }}
                    viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#7ec44f" strokeWidth=".8" />
                    ))}
                    {Array.from({ length: 17 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="450" stroke="#7ec44f" strokeWidth=".8" />
                    ))}
                  </svg>

                  {/* Overlay de hover */}
                  <Box className="monsai-thumb-overlay" sx={{
                    position: "absolute", inset: 0,
                    bgcolor: "rgba(10,26,5,.42)",
                    transition: "background .3s ease",
                    zIndex: 1,
                  }} />

                  {/* Botão play — position:absolute clássico, SEM transform externo */}
                  <Box sx={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",   // centralização real
                    zIndex: 2,
                  }}>
                    {/* Anel de pulso (animado, não interfere no centramento) */}
                    <Box sx={{
                      position: "absolute",
                      top: "50%", left: "50%",
                      width: 90, height: 90,
                      transform: "translate(-50%, -50%)",
                      border: "3px solid #7ec44f",
                      borderRadius: "50%",
                      animation: "monsai-pulseRing 1.8s ease-out infinite",
                      boxSizing: "border-box",
                      pointerEvents: "none",
                    }} />
                    {/* Disco do play — wrapper que recebe o scale no hover */}
                    <Box className="monsai-play-wrap" sx={{
                      width: 80, height: 80,
                      borderRadius: "50%",
                      bgcolor: "#4fa825",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 12px 28px rgba(0,0,0,.45)",
                    }}>
                      <PlayArrowIcon sx={{ color: "#fff", fontSize: "3rem", ml: .5 }} />
                    </Box>
                  </Box>

                  {/* Label canto inferior */}
                  <Box sx={{
                    position: "absolute", bottom: 14, left: 14, zIndex: 2,
                    bgcolor: "rgba(0,0,0,.55)", borderRadius: 1.5,
                    px: 1.5, py: .6, backdropFilter: "blur(4px)",
                  }}>
                    <Typography sx={{ color: "rgba(255,255,255,.9)", fontSize: ".75rem", fontWeight: 700, letterSpacing: .8 }}>
                      NOSSA APRESENTAÇÃO
                    </Typography>
                  </Box>
                </Box>
              </div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════════ PRODUTO ════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: "#ffffff", py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">

            <Grid item xs={12} md={6} sx={{ textAlign: { xs: "center", md: "left" } }}>
              <div ref={produtoTituloRef}>
                <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 800, letterSpacing: "2px" }}>
                  A Pulseira
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, mb: 3, color: "#1a3d0a" }}>
                  Design Compacto.<br />Sensores Robustos.
                </Typography>
              </div>
              <div ref={produtoTextoRef}>
                <Typography variant="body1" sx={{ color: "#4a6b3b", mb: 4, fontSize: "1.05rem", lineHeight: 1.85 }}>
                  Construída com MPU-6050 e MAX30102, a pulseira processa dados em tempo real através do
                  microcontrolador ESP32, garantindo que nenhum evento crítico passe despercebido.
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => onIrParaLojinha()}
                  sx={{ px: 5, py: 1.6, fontSize: "1rem", boxShadow: "0 8px 24px rgba(79,168,37,.3)", "&:hover": { bgcolor: "#2a5c14" } }}>
                  Ver Detalhes Técnicos
                </Button>
              </div>
            </Grid>

            {/* Imagem do produto
                ─ Wrapper de reveal (div puro, width:100%)
                ─ Box interno centraliza com mx:"auto"
                ─ Nenhum transform de layout no mesmo elemento do reveal        */}
            <Grid item xs={12} md={6}>
              <div ref={produtoImgRef} style={{ width: "100%" }}>
                <Box sx={{
                  width: "100%", maxWidth: 440,
                  mx: "auto",
                  borderRadius: 6, overflow: "hidden",
                  boxShadow: "0 24px 48px -12px rgba(42,92,20,.15)",
                  lineHeight: 0,
                }}>
                  <Box component="img" src={pulseiraMonsai || null}
                    alt="Pulseira MONSAI"
                    sx={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </div>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* ═══════════ EQUIPE ════════════════════════════════════════════════ */}
      <Box id="sobre-nos" sx={{ bgcolor: "background.paper", py: { xs: 10, md: 14 }, borderTop: "1px solid rgba(42,92,20,.1)" }}>
        <Container maxWidth="lg">
          <div ref={equipeTituloRef} style={{ textAlign: "center", marginBottom: 48 }}>
            <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 800, letterSpacing: "2px" }}>
              Engenharia por trás
            </Typography>
            <Typography variant="h3" sx={{ mt: 1, color: "#1a3d0a" }}>A Equipe MONSAI</Typography>
          </div>

          <Grid container spacing={6} alignItems="center">

            {/* Imagem da equipe — mesmo padrão: wrapper reveal + mx:auto */}
            <Grid item xs={12} md={5}>
              <div ref={equipeImgRef} style={{ width: "100%" }}>
                <Box sx={{
                  width: "100%", maxWidth: 420,
                  mx: "auto",
                  borderRadius: 6, overflow: "hidden",
                  boxShadow: "0 24px 48px -12px rgba(42,92,20,.15)",
                  lineHeight: 0,
                }}>
                  <Box component="img" src="equipe1.png" alt="Equipe MONSAI"
                    sx={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </div>
            </Grid>

            <Grid item xs={12} md={7} sx={{ textAlign: { xs: "center", md: "left" } }}>
              <div ref={equipeTextoRef}>
                <Typography variant="body1" sx={{ color: "#4a6b3b", fontSize: "1.05rem", lineHeight: 1.85 }}>
                  Somos desenvolvedores apaixonados por usar código e hardware para resolver problemas vitais.
                  Unimos infraestrutura em nuvem (Spring Boot), interfaces fluidas de alta fidelidade (React)
                  e sistemas embarcados em C++ para dar vida a um ecossistema focado no bem-estar e na
                  dignidade humana.
                </Typography>
              </div>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* ═══════════ CTA ════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: "#1a3d0a", py: { xs: 12, md: 16 }, px: 2, position: "relative", overflow: "hidden" }}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(126,196,79,.14) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div ref={ctaBlocoRef} style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <Typography variant="h2" sx={{ color: "#ffffff", mb: 3 }}>
            Pronto para transformar o cuidado?
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,.7)", mb: 5, fontSize: "1.1rem" }}>
            Traga a revolução do monitoramento IoT para a sua instituição hoje mesmo.
          </Typography>
          <Button variant="contained" color="secondary" onClick={() => onIrParaLojinha()}
            sx={{
              px: 6, py: 2, fontSize: "1.1rem", borderRadius: "12px",
              boxShadow: "0 12px 32px rgba(79,168,37,.4)",
              "&:hover": { bgcolor: "#7ec44f", color: "#1a3d0a" },
            }}>
            Solicitar Pulseira MONSAI
          </Button>
        </div>
      </Box>

      {/* ═══════════ FOOTER ═════════════════════════════════════════════════ */}
      <Box component="footer" id="contato" sx={{
        bgcolor: "#0a1a05", color: "rgba(255,255,255,.8)",
        py: { xs: 8, md: 10 }, px: { xs: 3, md: 5 },
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="flex-start" sx={{ mb: 6 }}>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Box component="img" src={logo} alt="MONSAI"
                sx={{ height: 36, mb: 3, mx: { xs: "auto", md: 0 }, filter: "brightness(0) invert(1)", display: "block" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,.6)", mb: 4, maxWidth: { xs: "100%", md: 280 }, lineHeight: 1.8 }}>
                Onde a engenharia de software encontra o respeito pela vida.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
                {[InstagramIcon, YouTubeIcon, LinkedInIcon].map((Icon, i) => (
                  <Box key={i} className="monsai-social" sx={{
                    width: 44, height: 44, borderRadius: 3,
                    bgcolor: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}>
                    <Icon sx={{ fontSize: "1.2rem", color: "#fff" }} />
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 700, mb: 3, fontSize: "1.1rem" }}>
                Contato Comercial
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, alignItems: { xs: "center", md: "flex-start" } }}>
                {[{ Icon: EmailIcon, text: "contato@monsai.com.br" }, { Icon: PhoneIcon, text: "(11) 3199-9999" }].map(({ Icon, text }, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(126,196,79,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7ec44f" }}>
                      <Icon fontSize="small" />
                    </Box>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,.8)", fontWeight: 500 }}>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 700, mb: 3, fontSize: "1.1rem" }}>
                Newsletter
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,.6)", mb: 3, lineHeight: 1.8 }}>
                Receba convites para nossos testes beta e atualizações da plataforma.
              </Typography>
              <Box sx={{
                display: "flex", borderRadius: "12px", overflow: "hidden",
                border: "1px solid rgba(255,255,255,.15)", bgcolor: "rgba(255,255,255,.05)",
                width: { xs: "100%", sm: "80%", md: "100%" }, mx: "auto",
              }}>
                <TextField size="small" placeholder="seu@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  sx={{ flex: 1, "& fieldset": { border: "none" }, "& input": { color: "#fff", py: 1.5, px: 2 } }}
                />
                <Button variant="contained" onClick={handleEnviarEmail}
                  sx={{ borderRadius: 0, bgcolor: "#4fa825", px: 3, "&:hover": { bgcolor: "#2a5c14" } }}>
                  Assinar
                </Button>
              </Box>
            </Grid>

          </Grid>

          <Box sx={{ borderTop: "1px solid rgba(255,255,255,.1)", pt: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.4)", fontSize: ".85rem" }}>
              © {new Date().getFullYear()} MONSAI. Todos os direitos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} videoUrl={PITCH_VIDEO_URL} />

    </ThemeProvider>
  );
}