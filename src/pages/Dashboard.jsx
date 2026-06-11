import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon           from '@mui/icons-material/Menu';
import MonitorHeartIcon   from '@mui/icons-material/MonitorHeart';
import PersonAddIcon      from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocationOnIcon     from '@mui/icons-material/LocationOn';
import LogoutIcon         from '@mui/icons-material/Logout';
import ElderlyIcon        from '@mui/icons-material/Elderly';
import ReportProblemIcon  from '@mui/icons-material/ReportProblem';
import ApartmentIcon      from '@mui/icons-material/Apartment';

import Monitoramento     from './Monitoramento';
import CadastrarUsuario  from './CadastrarUsuario';
import CadastrarIdoso    from './CadastrarIdoso';
import GerenciarUsuarios from './GerenciarUsuarios';
import GerenciarAsilos   from './GerenciarAsilos';  
import HistoricoAlertas  from './HistoricoAlertas';
import MinhaConta        from './MinhaConta';
import LocalizarIdoso    from './LocalizarIdoso'; 
import { useAuth }       from '../hooks/useAuth';

// ─── Configuração do menu unificada ──────────────────────────────────────────
const MENU_ITEMS = [
  { id: 'monitoramento', label: 'Monitoramento', icon: <MonitorHeartIcon />, perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR', 'SUPER_ADMIN'] },
  { id: 'cadastrar', label: 'Cadastrar Usuário', icon: <PersonAddIcon />, perfisPermitidos: ['GESTOR', 'SUPER_ADMIN'] },
  { id: 'gerenciar', label: 'Gerenciar Usuários', icon: <ManageAccountsIcon />, perfisPermitidos: ['GESTOR', 'SUPER_ADMIN'] },
  { id: 'cadastrar_idoso', label: 'Cadastrar Idoso', icon: <ElderlyIcon />, perfisPermitidos: ['GESTOR', 'CUIDADOR', 'SUPER_ADMIN'] },
  { id: 'localizar', label: 'Localizar Idoso', icon: <LocationOnIcon />, perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR', 'SUPER_ADMIN'] },
  { id: 'historico_alertas', label: 'Histórico de Alertas', icon: <ReportProblemIcon />, perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'SUPER_ADMIN', 'FAMILIAR'] },
  { id: 'gerenciar_asilos', label: 'Gerenciar Unidades', icon: <ApartmentIcon />, perfisPermitidos: ['SUPER_ADMIN'] },
];

const LABEL_PERFIL = {
  GESTOR:      'Gestor',
  CUIDADOR:    'Cuidador',
  ENFERMEIRO:  'Enfermeiro',
  FAMILIAR:    'Familiar',
  SUPER_ADMIN: 'Admin',
};

// ─── Injeção dinâmica ─────────────────────────────────────────────────────────
const renderizarTela = (telaAtiva, asiloId) => {
  const telas = {
    monitoramento:    <Monitoramento />,
    cadastrar_idoso:  <CadastrarIdoso gestorAsiloId={asiloId} />,
    cadastrar:        <CadastrarUsuario asiloId={asiloId} />,
    gerenciar:        <GerenciarUsuarios asiloId={asiloId} />,
    gerenciar_asilos: <GerenciarAsilos />, 
    minha_conta:      <MinhaConta />,
    localizar:        <LocalizarIdoso />, 
    historico_alertas: <HistoricoAlertas asiloId={asiloId} />,
  };
  return telas[telaAtiva] ?? <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Erro 404: Página não encontrada</Typography>;
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Dashboard({ perfil, asiloId, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telaAtiva, setTelaAtiva]   = useState('monitoramento');
  const { nome }                    = useAuth();
  
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));

  const perfilNormalizado = (perfil?.toUpperCase() || '').replace('ROLE_', '');
  const menuPermitido     = MENU_ITEMS.filter((item) => item.perfisPermitidos.includes(perfilNormalizado));

  const handleNavegar = (idTela) => { 
    setTelaAtiva(idTela); 
    if (!isDesktop) setDrawerOpen(false); 
  };
  
  const tituloPainel = LABEL_PERFIL[perfilNormalizado] || 'Usuário';

  const drawerWidth = 280;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f9f1' }}>

      {/* TOPBAR GLASSMORPHISM */}
      <AppBar 
        position="fixed"
        sx={{ 
          width: isDesktop ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: isDesktop ? `${drawerWidth}px` : 0,
          background: 'rgba(244, 249, 241, 0.85)', 
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(42, 92, 20, 0.05)', 
          borderBottom: '1px solid rgba(42, 92, 20, 0.1)',
          zIndex: (t) => t.zIndex.drawer - 1 
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {!isDesktop && (
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#1a3d0a', mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ color: '#1a3d0a', fontWeight: 800, letterSpacing: '-0.5px' }}>
              MONSAI
            </Typography>
            <Typography variant="caption" sx={{ color: '#4fa825', fontWeight: 600 }}>
              Painel {tituloPainel}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isDesktop && (
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: '#1a3d0a', fontWeight: 700 }}>{nome}</Typography>
                <Typography variant="caption" sx={{ color: '#4a6b3b' }}>{tituloPainel}</Typography>
              </Box>
            )}
            <Avatar sx={{ bgcolor: '#c8ddb8', color: '#1a3d0a', fontWeight: 'bold' }}>
              {nome.charAt(0)}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MENU LATERAL PREMIUM */}
      <Drawer 
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        sx={{ 
          width: drawerWidth, flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1a3d0a 0%, #2a5c14 100%)', 
            color: 'white', borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
          } 
        }}
      >
        {/* LOGO AREA */}
        <Box sx={{ height: 80, display: 'flex', alignItems: 'center', px: 3, mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#e4f0dc', letterSpacing: '1px' }}>
            MONSAI <span style={{ color: '#4fa825' }}>IoT</span>
          </Typography>
        </Box>

        <List sx={{ flexGrow: 1, px: 2 }}>
          {menuPermitido.map((item) => {
            const ativo = telaAtiva === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton 
                  onClick={() => handleNavegar(item.id)}
                  sx={{
                    borderRadius: '12px',
                    bgcolor: ativo ? 'rgba(126, 196, 79, 0.2)' : 'transparent',
                    color: ativo ? '#e4f0dc' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
                  }}
                >
                  <ListItemIcon sx={{ color: ativo ? '#7ec44f' : 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ fontWeight: ativo ? 700 : 500, fontSize: '0.95rem' }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 2, my: 2 }} />

        {/* BOTTOM AREA */}
        <List sx={{ px: 2, pb: 3 }}>
          <ListItem disablePadding sx={{ mb: 0.8 }}>
            <ListItemButton 
              onClick={() => handleNavegar('minha_conta')}
              sx={{ borderRadius: '12px', bgcolor: telaAtiva === 'minha_conta' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><ManageAccountsIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
              <ListItemText primary="Minha Conta" primaryTypographyProps={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton 
              onClick={onLogout}
              sx={{ borderRadius: '12px', '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.1)' } }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon sx={{ color: '#e74c3c' }} /></ListItemIcon>
              <ListItemText primary="Sair do Sistema" primaryTypographyProps={{ fontSize: '0.95rem', color: '#e74c3c', fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* CONTEÚDO PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, pt: { xs: 10, md: 12 }, width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
        {renderizarTela(telaAtiva, asiloId)}
      </Box>
    </Box>
  );
}