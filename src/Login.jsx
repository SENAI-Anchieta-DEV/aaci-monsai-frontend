import { useState } from "react";
import axios from 'axios';                      // faltava
import logo from "./assets/Logo_nome.png";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

const roles = [
  { id: "administrador", label: "Administrador" },
  { id: "gestor", label: "Gestor" },
  { id: "cuidador", label: "Cuidador" },
  { id: "enfermeira", label: "Enfermeira" },
  { id: "familiar", label: "Familiar" },
];

function PersonIcon({ color = "#2d5a27" }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="11" r="6" fill={color} />
      <path
        d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}



export default function MonsaiLogin({onLogin}) {
  const [selectedRole, setSelectedRole] = useState("gestor");
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    // 1. Chama o endpoint de autenticação
    const response = await axios.post('http://localhost:8080/auth/login', {
      email: credential,
      senha: password
    });

    // 2. Pega o token do retorno
    const { token } = response.data;

    // 3. Salva no localStorage
    localStorage.setItem('token', token);

    // 4. Configura o Axios para enviar o token em todas as chamadas
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 5. Avisa o App.js que o login foi bem sucedido
    onLogin();

  } catch (error) {
    console.error("Erro de autenticação:", error);
    alert("Falha no login: verifique suas credenciais.");
  }

  const handleLogin = () => {
    alert(`Login como: ${selectedRole}`);
  };
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#c8ddb8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      {/* Logo — deixe em branco para colocar a imagem depois */}
      <Box sx={{ mb: 1, textAlign: "center" }}>
        {/* Substitua o conteúdo abaixo pela sua <img> do logo */}
        <Box
             component="img"
             src= {logo}
             alt="MONSAI"
          sx={{
            width: 220,
            height: 64,
            mx: "auto",
            // Descomente e ajuste quando tiver a imagem:
          }}
        />
      </Box>

      {/* Main card + sidebar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

        {/* Role selector */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {roles.map((role) => {
            const active = selectedRole === role.id;
            return (
              <Button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                variant="contained"
                sx={{
                  bgcolor: active ? "#2d5a27" : "#8ec86a",
                  color: active ? "#fff" : "#1e3d1a",
                  flexDirection: "column",
                  gap: 0.3,
                  width: 90,
                  py: 1,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "0.72rem",
                  fontWeight: active ? 700 : 500,
                  boxShadow: active
                    ? "0 4px 14px rgba(45,90,39,0.4)"
                    : "0 2px 6px rgba(0,0,0,0.12)",
                  transform: active ? "scale(1.06)" : "scale(1)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: active ? "#245020" : "#7db85c",
                  },
                }}
              >
                <PersonIcon color={active ? "#fff" : "#2d5a27"} />
                {role.label}
              </Button>
            );
          })}
        </Box>

        {/* Login card */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(160deg, #a8d58a 0%, #4a8a3a 100%)",
            borderRadius: "20px",
            p: "2rem 2.5rem",
            width: 320,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#1a3a16",
              fontWeight: 700,
              textAlign: "left",
              fontFamily: "serif",
            }}
          >
            Login:
          </Typography>

          {/* Email / CPF */}
          <Box>
            <Typography
              sx={{
                color: "#1a3a16",
                fontWeight: 700,
                fontSize: "1.15rem",
                mb: 0.8,
                fontFamily: "serif",
              }}
            >
              Email/ CPF:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              placeholder=""
              sx={{
                bgcolor: "rgba(200,230,180,0.55)",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { border: "none" },
                },
                input: { color: "#1e3d1a" },
              }}
            />
          </Box>

          {/* Senha */}
          <Box>
            <Typography
              sx={{
                color: "#1a3a16",
                fontWeight: 700,
                fontSize: "1.15rem",
                mb: 0.8,
                fontFamily: "serif",
              }}
            >
              Senha:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              sx={{
                bgcolor: "rgba(200,230,180,0.55)",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "& fieldset": { border: "none" },
                },
                input: { color: "#1e3d1a" },
              }}
            />
          </Box>

          {/* Entrar */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleLogin}
              sx={{
                bgcolor: "#2d5a27",
                color: "#fff",
                borderRadius: "8px",
                px: 4,
                py: 0.9,
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(45,90,39,0.4)",
                "&:hover": { bgcolor: "#1e3d1a" },
              }}
            >
              Entrar
            </Button>
            <Typography
              sx={{
                color: "#1a3a16",
                fontSize: "0.82rem",
                cursor: "pointer",
                textDecoration: "underline",
                opacity: 0.8,
                "&:hover": { opacity: 1 },
              }}
            >
              Recuperar senha?
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}