import React, { useState } from 'react';
import { 
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText 
} from '@mui/material';
import MenuIcon          from '@mui/icons-material/Menu';
import MonitorHeartIcon  from '@mui/icons-material/MonitorHeart';
import PersonAddIcon     from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocationOnIcon    from '@mui/icons-material/LocationOn';
import LogoutIcon        from '@mui/icons-material/Logout';
import ElderlyIcon       from '@mui/icons-material/Elderly';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import Monitoramento    from './Monitoramento';
import CadastrarUsuario from './CadastrarUsuario';
import CadastrarIdoso   from './CadastrarIdoso';
import GerenciarUsuarios from './GerenciarUsuarios';
import MinhaConta       from './MinhaConta';
import { useAuth }      from '../hooks/useAuth';
import HistoricoAlertas from './HistoricoAlertas';

// ─── Configuração do menu com controle de acesso por perfil ──────────────────
const MENU_ITEMS = [
  {
    id: 'monitoramento',
    label: 'Monitoramento',
    icon: <MonitorHeartIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'],
  },
  {
    id: 'cadastrar',
    label: 'Cadastrar Usuário',
    icon: <PersonAddIcon />,
    perfisPermitidos: ['GESTOR'],
  },
  {
    id: 'gerenciar',
    label: 'Gerenciar Usuários',
    icon: <ManageAccountsIcon />,
    perfisPermitidos: ['GESTOR'],
  },
  {
    id: 'cadastrar_idoso',
    label: 'Cadastrar Idoso',
    icon: <ElderlyIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR'],
  },
  {
    id: 'localizar',
    label: 'Localizar Idoso',
    icon: <LocationOnIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'FAMILIAR'],
  },
  {
    id: 'historico_alertas',
    label: 'Histórico de Alertas',
    icon: <ReportProblemIcon />,
    perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO'],
  },
];

// ─── Labels de perfil para o título do painel ────────────────────────────────
const LABEL_PERFIL = {
  GESTOR:    'Gestor',
  CUIDADOR:  'Cuidador',
  ENFERMEIRO: 'Enfermeiro',
  FAMILIAR:  'Familiar',
};

// ─── Telas disponíveis por ID ─────────────────────────────────────────────────
// Recebe asiloId para repassar aos sub-componentes que necessitam
const renderizarTela = (telaAtiva, asiloId) => {
  const telas = {
    monitoramento:    <Monitoramento />,
    cadastrar_idoso:  <CadastrarIdoso gestorAsiloId={asiloId} />,
    cadastrar:        <CadastrarUsuario asiloId={asiloId} />,
    gerenciar:        <GerenciarUsuarios asiloId={asiloId} />,
    minha_conta:      <MinhaConta />,
    localizar:        <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Tela Localizar em breve</Typography>,
    historico_alertas: <HistoricoAlertas />
  };

  return telas[telaAtiva]
    ?? <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Erro 404: Página não encontrada</Typography>;
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function Dashboard({ perfil, asiloId, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telaAtiva, setTelaAtiva]   = useState('monitoramento');
  const { nome }                    = useAuth();

  // Normaliza o perfil para letras maiúsculas e remove prefixo ROLE_ para comparação
  const perfilNormalizado = (perfil?.toUpperCase() || '').replace('ROLE_', '');

  // Filtra o menu de acordo com os perfis permitidos de cada item
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

      {/* TOPBAR */}
      <AppBar
        component="header"
        position="fixed"
        sx={{ bgcolor: '#AED696', boxShadow: 'none', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Abrir menu"
            sx={{ color: '#1a3d0a', mr: 2 }}
          >
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

      {/* MENU LATERAL */}
      <Drawer
        component="nav"
        aria-label="Menu principal"
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
            flexDirection: 'column',
          },
        }}
      >
        {/* PARTE SUPERIOR DO MENU */}
        <List sx={{ flexGrow: 1 }}>
          {menuPermitido.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavegar(item.id)}
                aria-current={telaAtiva === item.id ? 'page' : undefined}
                sx={{
                  bgcolor: telaAtiva === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* PARTE INFERIOR: MINHA CONTA E SAIR */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavegar('minha_conta')}
              aria-current={telaAtiva === 'minha_conta' ? 'page' : undefined}
              sx={{ bgcolor: telaAtiva === 'minha_conta' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#AED696', color: '#1a3d0a', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {nome.charAt(0)}
                </Avatar>
              </ListItemIcon>
              <Box>
                <ListItemText
                  primary="Minha Conta"
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {nome}
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

      {/* CONTEÚDO PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 12 }}>
        {renderizarTela(telaAtiva, asiloId)}
      </Box>

    </Box>
  );
}