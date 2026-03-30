import React, { useState } from 'react';
import { 
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import ElderlyIcon from '@mui/icons-material/Elderly';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

// Importando a tela de monitoramento que criaremos abaixo
import Monitoramento from './Monitoramento';
import CadastrarUsuario from './CadastrarUsuario'; // Tela nova que criaremos
import CadastrarIdoso from './CadastrarIdoso';

export default function Dashboard({ perfil, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState('monitoramento'); // Começa sempre nos cards

  const menuItems = [
    { id: 'monitoramento', label: 'Monitoramento', icon: <MonitorHeartIcon /> },
    { id: 'pesquisar', label: 'Pesquisar Usuário', icon: <SearchIcon /> },
    { id: 'cadastrar', label: 'Cadastrar Usuário', icon: <PersonAddIcon /> },
    { id: 'remover', label: 'Remover Usuário', icon: <PersonRemoveIcon /> },
    { id: 'cadastrar_idoso', label: 'Cadastrar Idoso', icon: <ElderlyIcon /> },
    { id: 'localizar', label: 'Localizar Idoso', icon: <LocationOnIcon /> },
  ];

  const handleNavegar = (idTela) => {
    setTelaAtiva(idTela);
    setDrawerOpen(false); // Fecha o menu no mobile ao clicar
  };

  const renderizarTela = () => {
    switch (telaAtiva) {
      case 'monitoramento': return <Monitoramento />;
      case 'cadastrar': return <CadastrarUsuario />; 
      case 'cadastrar_idoso': return <CadastrarIdoso />;
      default: return <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Em construção...</Typography>;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7f1' }}>
      
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

      {/* MENU LATERAL */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 260, 
            boxSizing: 'border-box', 
            bgcolor: '#2d5a27', 
            color: 'white', 
            pt: 8,
            display: 'flex',
            flexDirection: 'column'
          },
        }}
      >
        {/* PARTE SUPERIOR DO MENU */}
        <List sx={{ flexGrow: 1 }}>
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

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* PARTE INFERIOR: MINHA CONTA */}
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavegar('minha_conta')}
              sx={{ bgcolor: telaAtiva === 'minha_conta' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#AED696', color: '#1a3d0a', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  AM
                </Avatar>
              </ListItemIcon>
              <Box>
                <ListItemText 
                  primary="Minha Conta" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  André Mendes
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: '#ff8a80' }} fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Sair do Sistema" 
                primaryTypographyProps={{ variant: 'body2', sx: { color: '#ff8a80' } }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 12 }}>
        {renderizarTela()}
      </Box>

    </Box>
  );
}