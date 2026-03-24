import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Grid, Card, CardContent, Typography, Box, IconButton, Chip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

export default function Monitoramento() {
  const [idosos, setIdosos] = useState([]);
  const [telemetria, setTelemetria] = useState({}); // Vai guardar { rfid_1: { bpm: 75, temp: 36.5 }, rfid_2: {...} }

  // 1. Busca os Idosos (Roda 1 vez ao carregar)
  const fetchIdosos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/idosos");
      setIdosos(response.data);
    } catch (error) {
      console.error("Erro ao buscar idosos do asilo", error);
    }
  };

  useEffect(() => {
    fetchIdosos();
  }, []);

  // 2. Polling de Telemetria (Roda a cada 3 segundos)
  useEffect(() => {
    if (idosos.length === 0) return;

    const interval = setInterval(async () => {
      // Aqui você fará a chamada para a sua rota IoT. 
      // Exemplo imaginário: percorre os idosos e busca os dados pelo serialDispositivo
      // const dadosNovos = {};
      // for (let idoso of idosos) {
      //   if(idoso.dispositivo?.serial) {
      //      const res = await axios.get(`http://localhost:8080/telemetria/${idoso.dispositivo.serial}`);
      //      dadosNovos[idoso.dispositivo.serial] = res.data;
      //   }
      // }
      // setTelemetria(dadosNovos);
      
      console.log("Batendo na API IoT..."); // Simulação
    }, 3000);

    return () => clearInterval(interval); // Limpa o intervalo ao sair da tela
  }, [idosos]);

  const handleDelete = async (id, nome) => {
    if (window.confirm(`ATENÇÃO: Deseja inativar o idoso ${nome}?`)) {
      try {
        await axios.delete(`http://localhost:8080/idosos/${id}`);
        alert("Idoso inativado com sucesso!");
        fetchIdosos(); // Atualiza a lista
      } catch (error) {
        alert("Erro ao inativar idoso.");
      }
    }
  };

  const handleEdit = (id) => {
    alert(`Abrir modal de edição para o Idoso ID: ${id} (Implementaremos o PutMapping aqui)`);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#1a3a16', fontWeight: 'bold', mb: 3 }}>
        Monitoramento em Tempo Real
      </Typography>

      <Grid container spacing={3}>
        {idosos.map((idoso) => (
          <Grid item xs={12} sm={6} md={4} key={idoso.id}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              <CardContent>
                
                {/* Cabeçalho do Card */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{idoso.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      RFID/Serial: {idoso.dispositivo?.serial || "Sem dispositivo"}
                    </Typography>
                  </Box>
                  <Chip 
                    label={idoso.ativo ? "Ativo" : "Inativo"} 
                    color={idoso.ativo ? "success" : "default"} 
                    size="small" 
                  />
                </Box>

                {/* Dados da Pulseira */}
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#d32f2f' }}>
                    <FavoriteIcon sx={{ mr: 1 }} />
                    <Typography>BPM: <strong>{telemetria[idoso.dispositivo?.serial]?.bpm || '--'}</strong></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#ef6c00' }}>
                    <ThermostatIcon sx={{ mr: 1 }} />
                    <Typography>Temp: <strong>{telemetria[idoso.dispositivo?.serial]?.temp || '--'} °C</strong></Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#1565c0' }}>
                    <DirectionsRunIcon sx={{ mr: 1 }} />
                    <Typography>Movimento: <strong>{telemetria[idoso.dispositivo?.serial]?.acelerometro || 'Normal'}</strong></Typography>
                  </Box>
                </Box>

                {/* Botões de Ação */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton color="primary" onClick={() => handleEdit(idoso.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(idoso.id, idoso.nome)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}