import { AppBar, Toolbar, Box, Button, IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logos/Logo_nome.png";
import AppDrawer from "./AppDrawer"; 
import { useState } from "react";

export default function Navbar({ onNavigate, currentScreen }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  // Esconde a Navbar se estiver no Dashboard ou AdminSetup para não poluir a tela
  if (currentScreen === 'painel' || currentScreen === 'admin_setup') return null;

  const handleLinkClick = (screen) => {
    onNavigate(screen);
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
            <Button onClick={() => onNavigate('home')} sx={navButtonStyle}>Sobre nós</Button>
            <Button onClick={() => onNavigate('home')} sx={navButtonStyle}>Contato</Button>
          </Box>
        ) : (
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#1a3d0a" }}>
            <MenuIcon />
          </IconButton>
        )}

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