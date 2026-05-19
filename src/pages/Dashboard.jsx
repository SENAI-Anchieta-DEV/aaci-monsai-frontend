import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText
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

// Importações corrigidas apontando para a mesma pasta pages/
import Monitoramento     from './Monitoramento';
import CadastrarUsuario  from './CadastrarUsuario';
import CadastrarIdoso    from './CadastrarIdoso';
import GerenciarUsuarios from './GerenciarUsuarios';
import GerenciarAsilos   from './GerenciarAsilos';  
import MinhaConta       from './MinhaConta';
import HistoricoAlertas  from './HistoricoAlertas'; // ✅ RECONSTITUÍDO: Seu componente clínico original resgatado
import { useAuth }       from '../hooks/useAuth';

// ─── Configuração do menu unificada (Nível de Acessos Coletivo + Super Admin) ─
const MENU_ITEMS = [
  {
    id: 'monitoramento',
    label: 'Monitoramento',
    icon: <MonitorHeartIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR', 'SUPER_ADMIN'],
  },
  {
    id: 'cadastrar',
    label: 'Cadastrar Usuário',
    icon: <PersonAddIcon />,
    perfisPermitidos: ['GESTOR', 'SUPER_ADMIN'],
  },
  {
    id: 'gerenciar',
    label: 'Gerenciar Usuários',
    icon: <ManageAccountsIcon />,
    perfisPermitidos: ['GESTOR', 'SUPER_ADMIN'],
  },
  {
    id: 'cadastrar_idoso',
    label: 'Cadastrar Idoso',
    icon: <ElderlyIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'SUPER_ADMIN'],
  },
  {
    id: 'localizar',
    label: 'Localizar Idoso',
    icon: <LocationOnIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR', 'SUPER_ADMIN'],
  },
  {
    id: 'historico_alertas',
    label: 'Histórico de Alertas',
    icon: <ReportProblemIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'SUPER_ADMIN', 'FAMILIAR'],
  },
  {
    id: 'gerenciar_asilos',
    label: 'Gerenciar Unidades',
    icon: <ApartmentIcon />,
    perfisPermitidos: ['SUPER_ADMIN'],
  },
];

const LABEL_PERFIL = {
  GESTOR:      'Gestor',
  CUIDADOR:    'Cuidador',
  ENFERMEIRO:  'Enfermeiro',
  FAMILIAR:    'Familiar',
  SUPER_ADMIN: 'Admin',
};

// ─── Injeção dinâmica de componentes na viewport principal ───────────────────
const renderizarTela = (telaAtiva, asiloId) => {
  const telas = {
    monitoramento:    <Monitoramento />,
    cadastrar_idoso:  <CadastrarIdoso gestorAsiloId={asiloId} />,
    cadastrar:        <CadastrarUsuario asiloId={asiloId} />,
    gerenciar:        <GerenciarUsuarios asiloId={asiloId} />,
    gerenciar_asilos: <GerenciarAsilos />, 
    minha_conta:      <MinhaConta />,
    localizar:        <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Tela Localizar em breve</Typography>,
    // ✅ Histórico de Alertas reconfigurado para ler o seu arquivo real em vez de texto Mockado
    historico_alertas: <HistoricoAlertas asiloId={asiloId} />, 
  };

  return telas[telaAtiva]
    ?? <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Erro 404: Página não encontrada</Typography>;
};

// ─── Componente Construtor do Dashboard ──────────────────────────────────────
export default function Dashboard({ perfil, asiloId, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telaAtiva, setTelaAtiva]   = useState('monitoramento');
  const { nome }                    = useAuth();

  const perfilNormalizado = (perfil?.toUpperCase() || '').replace('ROLE_', '');
  
  // Realiza a filtragem das opções do menu lateral dinamicamente em tempo de execução
  const menuPermitido = MENU_ITEMS.filter((item) =>
    item.perfisPermitidos.includes(perfilNormalizado)
  );

  const handleNavegar = (idTela) => { 
    setTelaAtiva(idTela); 
    setDrawerOpen(false); 
  };
  
  const tituloPainel = LABEL_PERFIL[perfilNormalizado] || 'Usuário';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7f1' }}>

      {/* TOPBAR GLOBAL */}
      <AppBar component="header" position="fixed"
        sx={{ bgcolor: '#AED696', boxShadow: 'none', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Abrir menu"
            sx={{ color: '#1a3d0a', mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ color: '#1a3d0a', fontWeight: 'bold', flexGrow: 1 }}>
            MONSAI — Painel {tituloPainel}
          </Typography>
          <IconButton onClick={onLogout} aria-label="Sair do sistema" sx={{ color: '#1a3d0a' }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* DRAWER LATERAL NATIVO (MATERIAL UI) */}
      <Drawer component="nav" aria-label="Menu principal" variant="temporary"
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 260, boxSizing: 'border-box',
          bgcolor: '#2d5a27', color: 'white', pt: 8,
          display: 'flex', flexDirection: 'column' } }}>

        <List sx={{ flexGrow: 1 }}>
          {menuPermitido.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton onClick={() => handleNavegar(item.id)}
                aria-current={telaAtiva === item.id ? 'page' : undefined}
                sx={{
                  bgcolor: telaAtiva === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}>
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavegar('minha_conta')}
              aria-current={telaAtiva === 'minha_conta' ? 'page' : undefined}
              sx={{ bgcolor: telaAtiva === 'minha_conta' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#AED696', color: '#1a3d0a',
                  fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {nome.charAt(0)}
                </Avatar>
              </ListItemIcon>
              <Box>
                <ListItemText primary="Minha Conta"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{nome}</Typography>
              </Box>
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon>
                <LogoutIcon sx={{ color: '#ff8a80' }} fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sair do Sistema"
                primaryTypographyProps={{ variant: 'body2', sx: { color: '#ff8a80' } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* RENDERIZADOR DA VIEWPORT */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 12 }}>
        {renderizarTela(telaAtiva, asiloId)}
      </Box>

    </Box>
  );
}