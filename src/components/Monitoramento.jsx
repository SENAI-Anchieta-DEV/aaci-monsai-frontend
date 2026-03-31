import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Grid, Card, CardContent, Typography, Box, IconButton, Chip, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

export default function Monitoramento() {
  const [idosos, setIdosos] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [telemetria, setTelemetria] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [idosoEditando, setIdosoEditando] = useState(null);

  

  const fetchIdosos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/idosos");
      setIdosos(response.data);
    } catch (error) {
      console.error("Erro ao buscar idosos", error);
    }
  };

  useEffect(() => {
    fetchIdosos();
  }, []);

  useEffect(() => {
    if (idosos.length === 0) return;

    const interval = setInterval(async () => {
      const dadosNovos = { ...telemetria };
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get("http://localhost:8080/api/telemetria/ultima", {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.data) {
          const dto = res.data;
          dadosNovos[dto.pulseira_id] = {
            bpm: dto.sinal_vital.frequencia_cardiaca_bpm,
            temp: dto.sinal_vital.temperatura_c,
            acelerometro: dto.sinal_vital.movimento.queda_detectada ? "QUEDA!" : "Normal",
            bateria: dto.status_do_dispositivo.nivel_bateria
          };
        }
        setTelemetria(dadosNovos);
      } catch (err) {
        console.error("Erro ao buscar telemetria:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [idosos, telemetria]);

  // LÓGICA DE FILTRO: Filtra a lista original baseada no que foi digitado
 // Filtra apenas os ATIVOS e que batem com o termo de pesquisa
const idososFiltrados = idosos.filter(idoso => 
  idoso.ativo && (
    idoso.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
    idoso.dispositivo?.serial?.toLowerCase().includes(termoPesquisa.toLowerCase())
  )
);

  const handleDelete = async (id, nome) => {
    if (window.confirm(`ATENÇÃO: Deseja inativar o idoso ${nome}?`)) {
      try {
        await axios.delete(`http://localhost:8080/idosos/${id}`);
        alert("Idoso inativado com sucesso!");
        fetchIdosos();
      } catch (error) {
        alert("Erro ao inativar idoso.");
      }
    }
  };

  const handleEdit = (id) => {
    alert(`Abrir modal de edição para o Idoso ID: ${id}`);
    setIdosoEditando({ ...idoso });
    setOpenModal(true);
  };

  const salvarEdicao = async () => {
    try {
      await axios.put(`http://localhost:8080/idosos/${idosoEditando.id}`, {
        nome: idosoEditando.nome,
        cpf: idosoEditando.cpf,
        email: idosoEditando.email,
        serialDispositivo: idosoEditando.dispositivo?.serial // Mantém o vínculo
      });
      alert("Dados atualizados!");
      setOpenModal(false);
      fetchIdosos(); // Recarrega os cards
    } catch (err) {
      alert("Erro ao atualizar idoso.");
    }
  };

  return (
  <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
    
    {/* CABEÇALHO */}
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 3, 
        mb: 5 
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ color: '#1a3a16', fontWeight: 'bold' }}>
          Monitoramento em Tempo Real
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhando {idososFiltrados.length} idosos ativos no sistema
        </Typography>
      </Box>

      <TextField 
        label="Pesquisar por nome ou serial..." 
        variant="outlined" 
        size="small"
        onChange={(e) => setTermoPesquisa(e.target.value)}
        sx={{ 
          width: { xs: '100%', sm: 350 }, 
          bgcolor: 'white', 
          borderRadius: 2,
          '& .MuiOutlinedInput-root': { borderRadius: 2 }
        }}
      />
    </Box>

    {/* GRID DE CARDS */}
    <Grid container spacing={3}>
      {idososFiltrados.map((idoso) => (
        <Grid key={idoso.id} item xs={12} sm={6} md={4} lg={3}>
          <Card 
            sx={{ 
              borderRadius: 4, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid #e0e0e0',
              overflow: 'visible',
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              
              {/* Cabeçalho do Card */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50', lineHeight: 1.2 }}>
                    {idoso.nome}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', fontWeight: 500 }}>
                    RFID: {idoso.dispositivo?.serial || "NÃO VINCULADO"}
                  </Typography>
                </Box>
                <Chip 
                  label={idoso.ativo ? "ATIVO" : "INATIVO"} 
                  color={idoso.ativo ? "success" : "default"} 
                  size="small" 
                  sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                />
              </Box>

              {/* Bloco de Dados Vitais - Estilo "Painel" */}
              <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 3, mb: 2, border: '1px solid #f1f2f6' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <FavoriteIcon sx={{ color: '#d32f2f', mr: 1.5, fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">Frequência Cardíaca</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {telemetria[idoso.dispositivo?.id]?.bpm || '--'} <small style={{fontSize: 12}}>BPM</small>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ThermostatIcon sx={{ color: '#ef6c00', mr: 1.5, fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">Temperatura Corporal</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {telemetria[idoso.dispositivo?.id]?.temp || '--'} <small style={{fontSize: 12}}>°C</small>
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status de Movimento e Ações */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DirectionsRunIcon 
                    sx={{ 
                      mr: 0.5, 
                      fontSize: 20, 
                      color: telemetria[idoso.dispositivo?.id]?.acelerometro === "QUEDA!" ? '#d32f2f' : '#2ecc71' 
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ color: telemetria[idoso.dispositivo?.id]?.acelerometro === "QUEDA!" ? '#d32f2f' : '#2ecc71' }}
                  >
                    {telemetria[idoso.dispositivo?.id]?.acelerometro || "Normal"}
                  </Typography>
                </Box>
                
                <Box>
                  <IconButton size="small" sx={{ color: '#3498db' }} onClick={() => handleEdit(idoso.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#e74c3c' }} onClick={() => handleDelete(idoso.id, idoso.nome)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    {/* MENSAGEM DE BUSCA VAZIA */}
    {idososFiltrados.length === 0 && (
      <Box sx={{ textAlign: 'center', mt: 15, py: 5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 4 }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Nenhum idoso encontrado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Não localizamos resultados para: <strong>"{termoPesquisa}"</strong>
        </Typography>
      </Box>
    )}

    {/* MODAL DE EDIÇÃO */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'white', borderRadius: 4, p: 4, boxShadow: 24 
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Editar Idoso</Typography>
          
          <MuiTextField 
            fullWidth label="Nome" sx={{ mb: 2 }}
            value={idosoEditando?.nome || ""} 
            onChange={(e) => setIdosoEditando({...idosoEditando, nome: e.target.value})}
          />
          <MuiTextField 
            fullWidth label="Email do Familiar" sx={{ mb: 2 }}
            value={idosoEditando?.email || ""} 
            onChange={(e) => setIdosoEditando({...idosoEditando, email: e.target.value})}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button fullWidth variant="outlined" onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button fullWidth variant="contained" sx={{ bgcolor: '#2d5a27' }} onClick={salvarEdicao}>Salvar</Button>
          </Box>
        </Box>
      </Modal>
  </Box>
);
}