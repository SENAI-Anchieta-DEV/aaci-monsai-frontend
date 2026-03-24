import React, { useState } from 'react';
import { 
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';

// Importando a tela de monitoramento que criaremos abaixo
import Monitoramento from './Monitoramento';

export default function Dashboard({ perfil, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState('monitoramento'); // Começa sempre nos cards

  const menuItems = [
    { id: 'monitoramento', label: 'Monitoramento', icon: <MonitorHeartIcon /> },
    { id: 'cadastrar', label: 'Cadastrar Usuário', icon: <PersonAddIcon /> },
    { id: 'pesquisar', label: 'Pesquisar Usuário', icon: <SearchIcon /> },
    { id: 'remover', label: 'Remover Usuário', icon: <PersonRemoveIcon /> },
    { id: 'localizar', label: 'Localizar Idoso', icon: <LocationOnIcon /> },
  ];

  const handleNavegar = (idTela) => {
    setTelaAtiva(idTela);
    setDrawerOpen(false); // Fecha o menu no mobile ao clicar
  };

  const renderizarTela = () => {
    switch (telaAtiva) {
      case 'monitoramento': return <Monitoramento />;
      // case 'cadastrar': return <CadastrarUsuario />; // Faremos a seguir
      // case 'pesquisar': return <PesquisarUsuario />; // Faremos a seguir
      default: return <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Em construção...</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#c8ddb8' }}>
      
      {/* TOPBAR */}
      <AppBar position="fixed" sx={{ bgcolor: '#AED696', boxShadow: 'none', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: '#1a3d0a', mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#1a3d0a', fontWeight: 'bold', flexGrow: 1 }}>
            MONSAI - Painel Gestor
          </Typography>
          <IconButton onClick={onLogout} sx={{ color: '#1a3d0a' }} title="Sair">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* MENU LATERAL (DRAWER) */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box', bgcolor: '#2d5a27', color: 'white', pt: 8 },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton 
                onClick={() => handleNavegar(item.id)}
                sx={{ 
                  bgcolor: telaAtiva === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* ÁREA CENTRAL DE CONTEÚDO */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        {renderizarTela()}
      </Box>
    </Box>
  );
}