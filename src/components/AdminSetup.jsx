import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  TextField, Paper, Container, Divider 
} from "@mui/material";

export const FormularioCadastroGestor = ({ asiloId, onFinish }) => {
  // Inicializa o estado do formulário para o perfil GESTOR
  const [gestor, setGestor] = useState({ nome: '', email: '', senha: '', cpf: '' });

  // Submete os dados para configuração final do asilo
  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8080/usuarios", {
        ...gestor,
        tipoUsuario: "GESTOR",
        asiloId: asiloId
      });
      
      alert("Configuração finalizada com sucesso! Faça Login novamente.");
      
      // Chama a função onFinish se ela foi injetada pelo pai
      if (onFinish) onFinish(); 

    } catch (error) {
      console.error("Erro na requisição:", error.response?.data || error.message);
      
      // Verifica se o erro é uma resposta válida da API (Ex: DataIntegrityViolationException)
      if (error.response) {
        const mensagem = error.response.data.detail || error.response.data.message || "Verifique se CPF ou Email já estão cadastrados.";
        alert(mensagem);
      } else {
        // Trata falhas de rede ou interrupções abruptas
        alert("Erro interno no sistema. Verifique o console.");
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a3d0a' }}>
        Passo 2: Cadastro do Gestor Responsável
      </Typography>
      <Divider />
      <TextField label="Nome do Gestor" fullWidth variant="filled"
        onChange={(e) => setGestor({...gestor, nome: e.target.value})} />
      <TextField label="Email" fullWidth variant="filled"
        onChange={(e) => setGestor({...gestor, email: e.target.value})} />
      <TextField label="CPF" fullWidth variant="filled"
        onChange={(e) => setGestor({...gestor, cpf: e.target.value})} />
      <TextField label="Senha" type="password" fullWidth variant="filled"
        onChange={(e) => setGestor({...gestor, senha: e.target.value})} />
      
      <Button 
        variant="contained" 
        fullWidth 
        size="large"
        onClick={handleSubmit}
        sx={{ mt: 2, bgcolor: "#2d5a27", py: 1.5, fontWeight: 'bold' }}
      >
        Finalizar e Salvar Unidade
      </Button>
    </Box>
  );
};

// Componente Principal
export default function OnBoardingAdmin({ onFinish, onLogout }) {
  const [activeStep, setActiveStep] = useState(0);
  const [asiloData, setAsiloData] = useState({ nome: '', cnpj: '', endereco: '' });
  const [asiloId, setAsiloId] = useState(null);

  const handleCriarAsilo = async () => {
    if(!asiloData.nome || !asiloData.cnpj) return alert("Preencha os dados do Asilo");
    
    try {
      const res = await axios.post("http://localhost:8080/asilos", asiloData);
      // Garante que pegamos o ID vindo do banco
      setAsiloId(res.data.id || res.data.asilo_id); 
      setActiveStep(1);
    } catch (error) {
      console.error("Erro ao criar asilo:", error);
      alert("Erro ao criar asilo. Verifique se o CNPJ é válido ou se já existe.");
    }
  };

  const steps = ['Dados do Asilo', 'Gestor Responsável'];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#c8ddb8", display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 5, borderRadius: '20px', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: "#2d5a27", fontWeight: 800, mb: 1 }}>
            MONSAI
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Configuração Inicial de Nova Unidade
          </Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nome da Unidade (Asilo)" fullWidth 
                onChange={(e) => setAsiloData({...asiloData, nome: e.target.value})} />
              <TextField label="CNPJ" fullWidth 
                onChange={(e) => setAsiloData({...asiloData, cnpj: e.target.value})} />
              <TextField label="Endereço Completo" fullWidth 
                onChange={(e) => setAsiloData({...asiloData, endereco: e.target.value})} />
              
              <Button 
                variant="contained" 
                onClick={handleCriarAsilo} 
                sx={{ bgcolor: "#2d5a27", mt: 2, py: 1.5 }}
              >
                Próximo: Cadastrar Gestor
              </Button>
            </Box>
          ) : (
            /* Ajustado aqui: passamos onFinish para o componente filho */
            <FormularioCadastroGestor asiloId={asiloId} onFinish={onFinish} />
          )}
          
          <Button 
            onClick={onLogout} 
            fullWidth 
            sx={{ mt: 4, color: 'gray', textTransform: 'none', fontWeight: 500 }}
          >
            Sair do Painel Admin
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}