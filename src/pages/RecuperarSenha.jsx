import { useState } from "react";
import { 
  Box, Button, TextField, Typography, Paper, 
  AppBar, Toolbar, IconButton, Drawer, List, 
  ListItem, ListItemButton, ListItemText, useMediaQuery 
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logos/Logo_nome.png";
import { useToast } from "../components/ToastContext";

// ─── TEMA (O mesmo do Login) ──────────────────────────────────────────────────
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

const navLinks = ["Voltar ao Home", "Sobre nós", "Contato"];

export default function RecuperarSenha({ onVoltar, onProximo }) { // <--- ADICIONE onProximo AQUI
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const showToast = useToast();

  // --- ADICIONE ESTA FUNÇÃO QUE ESTAVA FALTANDO ---
  const handleNav = (link) => {
    setDrawerOpen(false);
    if (link === "Voltar ao Home" && onVoltar) onVoltar();
    // Adicione outras lógicas de navegação se precisar
  };

  const handleEnviarCodigo = () => {
    if (!email || !email.includes("@")) {
      showToast({ type: "error", title: "Email inválido", message: "Insira um email válido." });
      return;
    }
    const cod = Math.floor(1000 + Math.random() * 9000);
    showToast({ 
      type: "success", 
      title: "Código enviado!", 
      message: `Seu código de teste é: ${cod}`, // O alert que você pediu!
      duration: 10000 
    });
  };

  const handleRedefinir = () => {
    if (codigo.length < 4) {
      showToast({ type: "error", title: "Código incompleto/Email Errado", message: "Digite seu email corretamente/codigo corretamente." });
      return;
    }
    // Agora o onProximo vai funcionar porque está declarado lá no topo!
    onProximo(); 
  };
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#c8ddb8", display: "flex", flexDirection: "column" }}>
        
        {/* ── NAVBAR (Igual ao Login) ── */}
        <AppBar position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
          <Toolbar sx={{ px: { xs: 2, md: 5 }, justifyContent: "space-between" }}>
            <Box component="img" src={logo} alt="MONSAI" sx={{ height: 40, objectFit: "contain" }} />

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {navLinks.map((link) => (
                  <Button key={link} onClick={() => handleNav(link)}
                    sx={{ color: "#1a3d0a", fontWeight: 600, fontSize: "0.85rem" }}>
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

        {/* ── CONTEÚDO CENTRAL ── */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          
          {/* Card de Recuperação (Mesmo Estilo do Card de Login) */}
          <Paper elevation={0} sx={{
            background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
            borderRadius: "20px", 
            p: "2rem 2.5rem", 
            width: 320, // Mesma largura do Login
            display: "flex", 
            flexDirection: "column", 
            gap: 2.5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}>
            
            <Typography variant="h4" sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1.6rem" }}>
              Recuperar senha:
            </Typography>

            {/* Email */}
            <Box>
              <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1rem", mb: 0.8 }}>
                Email:
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField fullWidth variant="outlined" size="small"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px",
                    "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" } },
                  }}
                />
                <Button onClick={handleEnviarCodigo}
                  sx={{ bgcolor: "#2d5a27", color: "#fff", borderRadius: "8px", px: 2, 
                  "&:hover": { bgcolor: "#1e3d1a" } }}>
                  OK
                </Button>
              </Box>
            </Box>

            {/* Código */}
            <Box>
              <Typography sx={{ color: "#1a3a16", fontWeight: 700, fontSize: "1rem", mb: 0.8 }}>
                Código:
              </Typography>
              <TextField fullWidth variant="outlined" size="small"
                value={codigo} onChange={(e) => setCodigo(e.target.value)}
                sx={{
                  bgcolor: "rgba(200,230,180,0.55)", borderRadius: "8px",
                  "& .MuiOutlinedInput-root": { "& fieldset": { border: "none" } },
                }}
              />
            </Box>

            {/* Botão Final */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 1 }}>
              <Button variant="contained" onClick={handleRedefinir}
                sx={{
                  bgcolor: "#2d5a27", color: "#fff", borderRadius: "8px",
                  px: 4, py: 1, fontWeight: 700, width: "100%",
                  boxShadow: "0 4px 14px rgba(45,90,39,0.4)",
                  "&:hover": { bgcolor: "#1e3d1a" },
                }}>
                Redefinir Senha
              </Button>
              
              <Typography onClick={onVoltar}
                sx={{ color: "#1a3a16", fontSize: "0.82rem", mt: 2,
                  cursor: "pointer", textDecoration: "underline", opacity: 0.8 }}>
                Voltar ao login
              </Typography>
            </Box>

          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
