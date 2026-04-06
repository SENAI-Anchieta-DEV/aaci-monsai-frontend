import React, { useState } from 'react';
import { 
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, Avatar,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import ElderlyIcon from '@mui/icons-material/Elderly';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

// Importando a tela de monitoramento que criaremos abaixo
import Monitoramento from './Monitoramento';
import CadastrarUsuario from './CadastrarUsuario';
import CadastrarIdoso from './CadastrarIdoso';
import GerenciarUsuarios from './GerenciarUsuarios';
import MinhaConta from './MinhaConta'


export default function Dashboard({ perfil, asiloId, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState('monitoramento');

  // 1. Padroniza o perfil para letras maiúsculas para evitar erros de digitação (ex: ROLE_CUIDADOR ou apenas CUIDADOR)
  const perfilUsuario = perfil?.toUpperCase() || '';

  // 2. Adiciona a regra 'perfisPermitidos' em cada item do menu
  const menuItems = [
    { 
      id: 'monitoramento', label: 'Monitoramento', icon: <MonitorHeartIcon />, 
      perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'ROLE_GESTOR', 'ROLE_CUIDADOR', 'ROLE_ENFERMEIRO','FAMILIAR', 'ROLE_FAMILIAR'] 
    },
    { 
      id: 'cadastrar', label: 'Cadastrar Usuário', icon: <PersonAddIcon />, 
      perfisPermitidos: ['GESTOR', 'ROLE_GESTOR'] // Apenas Gestor
    },
    { 
      id: 'gerenciar', label: 'Gerenciar Usuários', icon: <ManageAccountsIcon />, 
      perfisPermitidos: ['GESTOR', 'ROLE_GESTOR'] // Apenas Gestor
    },
    { 
      id: 'cadastrar_idoso', label: 'Cadastrar Idoso', icon: <ElderlyIcon />,
      perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ROLE_GESTOR', 'ROLE_CUIDADOR'] 
    },
    { 
      id: 'localizar', label: 'Localizar Idoso', icon: <LocationOnIcon />, 
      perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'ROLE_GESTOR', 'ROLE_CUIDADOR', 'ROLE_ENFERMEIRO', 'FAMILIAR', 'ROLE_FAMILIAR'] 
    },
    { 
      id: 'historico_alertas', label: 'Histórico de Alertas', icon: <ReportProblemIcon />,
      perfisPermitidos: ['GESTOR', 'CUIDADOR', 'ENFERMEIRO', 'ROLE_GESTOR', 'ROLE_CUIDADOR', 'ROLE_ENFERMEIRO'] 
    }
  ];

  // 3. Filtra o menu ANTES de exibi-lo. Se o perfil do usuário não estiver na lista, o botão nem renderiza.
  const menuPermitido = menuItems.filter(item => 
    item.perfisPermitidos.some(p => perfilUsuario.includes(p))
  );

  const handleNavegar = (idTela) => {
    setTelaAtiva(idTela);
    setDrawerOpen(false);
  };

  // 4. Protege a renderização. Se houver falha e a tela não bater com a permissão, bloqueamos.
  const renderizarTela = () => {
    // Verificação extra de segurança para a tela de cadastro de idoso
    if (telaAtiva === 'cadastrar_idoso' && perfilUsuario.includes('ENFERMEIRA')) {
        return <Typography variant="h5" sx={{ mt: 5, textAlign: 'center', color: 'red' }}>Acesso Negado</Typography>;
    }

    switch (telaAtiva) {
      case 'monitoramento': return <Monitoramento />;
      case 'cadastrar_idoso': return <CadastrarIdoso gestorAsiloId={asiloId} />;
      case 'cadastrar': return <CadastrarUsuario asiloId={asiloId} />; 
      case 'gerenciar': return <GerenciarUsuarios asiloId={asiloId} />;
      case 'minha_conta': return <MinhaConta />;
      case 'localizar': return <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Tela Localizar em breve</Typography>;
      case 'historico_alertas': return <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Tela Histórico em breve</Typography>;
      
      default: return <Typography variant="h5" sx={{ mt: 5, textAlign: 'center' }}>Erro 404: Página não encontrada</Typography>;
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
  MONSAI - Painel {perfilUsuario.includes('GESTOR') ? 'Gestor' : 
                   perfilUsuario.includes('CUIDADOR') ? 'Cuidador' : 'Enfermeiro'}
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
          {menuPermitido.map((item) => (
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
                  {/* Pega a primeira letra do nome salvo no localStorage */}
                  {localStorage.getItem('nomeUsuario')?.charAt(0) || 'U'}
                </Avatar>
              </ListItemIcon>
              <Box>
                <ListItemText 
                  primary="Minha Conta" 
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {/* Exibe o nome real do usuário logado */}
                  {localStorage.getItem('nomeUsuario') || 'Usuário'}
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