import { 
  Box, Drawer, List, ListItem, ListItemButton, 
  ListItemText, IconButton, Divider, Typography 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import PhoneIcon from "@mui/icons-material/Phone";
import logo from "../assets/logos/Logo_nome.png";

// Mapeamento dos links com suporte a seções (BUG-06 Fix)
const NAV_LINKS = [
  { label: "Solicitar adesão", path: "lojinha", icon: <ShoppingCartIcon fontSize="small" /> },
  { label: "Sou Cliente",      path: "login",   icon: <PersonIcon fontSize="small" /> },
  { label: "Sobre nós",        path: "home",    section: "sobre-nos", icon: <InfoIcon fontSize="small" /> },
  { label: "Contato",          path: "home",    section: "contato",   icon: <PhoneIcon fontSize="small" /> },
];

export default function AppDrawer({ open, onClose, onNav }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ 
        sx: { 
          width: 280, 
          bgcolor: "#1a3d0a", // Fundo verde escuro MONSAI
          color: "#fff", 
          pt: 0 
        } 
      }}
    >
      {/* Cabeçalho com fundo verde claro e a Logo */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        px: 2, 
        py: 2, 
        bgcolor: "#AED696" // Verde claro da Navbar
      }}>
        <Box 
          component="img" 
          src={logo} 
          alt="MONSAI" 
          sx={{ height: 35, objectFit: "contain" }} 
        />
        <IconButton onClick={onClose} sx={{ color: "#1a3d0a" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Lista de Navegação */}
      <List sx={{ pt: 2 }}>
        {NAV_LINKS.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              // Passa path e section para a função de navegação centralizada
              onClick={() => onNav(item.path, item.section)} 
              sx={{ 
                px: 3, 
                py: 2, 
                gap: 2, 
                "&:hover": { bgcolor: "rgba(174, 214, 150, 0.1)" } 
              }}
            >
              <Box sx={{ color: "#AED696", display: "flex", alignItems: "center" }}>
                {item.icon}
              </Box>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontFamily: "'Montserrat', sans-serif", 
                  fontWeight: 600, 
                  fontSize: "1rem", 
                  color: "#fff",
                  letterSpacing: "0.5px"
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Rodapé do Drawer */}
      <Box sx={{ mt: 'auto', p: 3, textAlign: 'center', opacity: 0.5 }}>
        <Typography variant="caption">MONSAI v1.0</Typography>
      </Box>
    </Drawer>
  );
}