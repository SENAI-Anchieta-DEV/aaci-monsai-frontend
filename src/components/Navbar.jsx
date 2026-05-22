import { AppBar, Toolbar, Box, Button, IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logos/Logo_nome.png";
import AppDrawer from "./AppDrawer"; 
import { useState } from "react";

export default function Navbar({ onNavigate, currentScreen }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  // Esconde a Navbar em telas de gestão para manter o foco no Dashboard
  if (currentScreen === 'painel' || currentScreen === 'admin_setup') return null;

  // Função centralizada para lidar com cliques (Desktop e Mobile)
  const handleLinkClick = (screen, section = null) => {
    onNavigate(screen, section); // Passa a tela e a seção (se houver) para o App.js
    setDrawerOpen(false); // Garante que o menu lateral feche no mobile
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#AED696", boxShadow: "none" }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 5 } }}>
        
        {/* LOGO -> Home (Resetando scroll) */}
        <Box 
          component="img" 
          src={logo} 
          alt="MONSAI"
          onClick={() => handleLinkClick('home')} // Usando a função centralizada
          sx={{ height: 40, cursor: "pointer", objectFit: "contain" }} 
        />

        {!isMobile ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button onClick={() => handleLinkClick('lojinha')} sx={navButtonStyle}>Solicitar adesão</Button>
            <Button onClick={() => handleLinkClick('login')} sx={navButtonStyle}>Sou Cliente</Button>
            
            {/* Links com Âncora para a Home */}
            <Button onClick={() => handleLinkClick('home', 'sobre-nos')} sx={navButtonStyle}>Sobre nós</Button>
            <Button onClick={() => handleLinkClick('home', 'contato')} sx={navButtonStyle}>Contato</Button>
          </Box>
        ) : (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#1a3d0a" }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Menu Lateral Mobile */}
        <AppDrawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)} 
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