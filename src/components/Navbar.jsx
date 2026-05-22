import { AppBar, Toolbar, Box, Button, IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logos/Logo_nome.png";
import AppDrawer from "./AppDrawer"; 
import { useState } from "react";

export default function Navbar({ onNavigate, currentScreen }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  if (currentScreen === 'painel' || currentScreen === 'admin_setup') return null;

  // 1. Atualize o handleLinkClick para aceitar a seção (opcional)
  const handleLinkClick = (screen, section) => {
    onNavigate(screen, section); // Passa os dois para o App.js
    setDrawerOpen(false);
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 5 } }}>
        
        {/* LOGO -> Home */}
        <Box 
          component="img" 
          src={logo} 
          alt="MONSAI"
          onClick={() => onNavigate('home')}
          sx={{ height: 40, cursor: "pointer", objectFit: "contain" }} 
        />

        {!isMobile ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={() => onNavigate('lojinha')} sx={navButtonStyle}>Solicitar adesão</Button>
            <Button onClick={() => onNavigate('login')} sx={navButtonStyle}>Sou Cliente</Button>
            
            {/* 2. AQUI ESTÁ O CONCERTO: Passando o ID da seção como segundo parâmetro */}
            <Button onClick={() => onNavigate('home', 'sobre-nos')} sx={navButtonStyle}>Sobre nós</Button>
            <Button onClick={() => onNavigate('home', 'contato')} sx={navButtonStyle}>Contato</Button>
          </Box>
        ) : (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#1a3d0a" }}>
            <MenuIcon />
          </IconButton>
        )}

        <AppDrawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)} 
          // 3. Garanta que o Drawer também saiba navegar com seções
          onNav={handleLinkClick} 
        />
      </Toolbar>
    </AppBar>
  );
}

const navButtonStyle = {
  color: "#1a3d0a",
  fontWeight: 700,
  textTransform: "none",
  "&:hover": { bgcolor: "rgba(0,0,0,0.05)" }
};