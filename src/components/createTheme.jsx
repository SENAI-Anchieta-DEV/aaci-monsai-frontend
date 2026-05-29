import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { 
      light: "#5CB52D", 
      main: "#227E35",  
      dark: "#02502C",  
      contrastText: "#FFFFFF", 
    },
    secondary: { 
      light: "#CCE5C1", 
      main: "#649C7E",  
      dark: "#429636",  
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F5F5F5", 
      paper: "#FFFFFF",   
    },
    text: {
      primary: "#333333",   
      secondary: "#9E9E9E", 
    },
  },
  typography: {
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    button: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 28, boxShadow: "none" } } },
  },
});

export default theme; // Isso é o que permite importar em outros lugares!