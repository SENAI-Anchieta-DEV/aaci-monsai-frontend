import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Avatar, 
  Card, 
  CardContent,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from '../utils/api';
import { useToast } from '../components/ToastContext';

export default function PesquisarSerial() {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [idoso, setIdoso] = useState(null);
  const showToast = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!serial.trim()) {
      showToast({ type: "warning", title: "Atenção", message: "Digite o serial do dispositivo antes de buscar." });
      return;
    }

    setLoading(true);
    try {
      // Ajuste a rota para a que faz a busca por serial no seu backend Spring Boot
      // Exemplo: GET /idosos/serial/{serial}
      const response = await api.get(`/idosos/serial/${encodeURIComponent(serial.trim())}`);
      
      const dadosIdoso = response.data;
      
      setIdoso({
        nome: dadosIdoso.nome || "Nome não cadastrado",
        foto: dadosIdoso.foto || "",
        // Pega os dados vitais caso venham aninhados no objeto dispositivo, aplicando valores de fallback para teste visual
        temperatura: dadosIdoso.dispositivo?.temperatura || "36.5",
        bpm: dadosIdoso.dispositivo?.bpm || "78"
      });

      showToast({ type: "success", title: "Dispositivo Localizado", message: "Monitoramento carregado com sucesso." });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || "Nenhum idoso encontrado com este serial.";
      showToast({ type: "error", title: "Erro na busca", message: msg });
      setIdoso(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaBusca = () => {
    setIdoso(null);
    setSerial('');
  };

  return (
    <Box component="section" sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
      
      {/* TELA DE BUSCA */}
      {!idoso ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            borderRadius: 4, 
            border: '1px solid #e0e0e0',
            textAlign: 'center',
            bgcolor: '#ffffff'
          }}
        >
          <Typography 
            component="h2" 
            variant="h5" 
            sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}
          >
            PROCURAR POR SERIAL
          </Typography>

          <Box component="form" onSubmit={handleSearch} noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              required
              label="Serial do Dispositivo"
              variant="outlined"
              placeholder="Ex: 124-abc"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                bgcolor: '#2d5a27', 
                '&:hover': { bgcolor: '#1a3d0a' }, 
                px: 6, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Buscar Dispositivo'}
            </Button>
          </Box>
        </Paper>
      ) : (

        /* TELA DE RESULTADO / MONITORAMENTO */
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid #e0e0e0',
            textAlign: 'center',
            bgcolor: '#ffffff',
            position: 'relative'
          }}
        >
          <IconButton 
            onClick={handleNovaBusca} 
            sx={{ position: 'absolute', left: 16, top: 16, color: '#2d5a27' }}
            title="Nova Busca"
          >
            <ArrowBackIcon />
          </IconButton>

          <Avatar
            src={idoso.foto}
            alt={idoso.nome}
            sx={{ 
              width: 100, 
              height: 100, 
              mx: 'auto', 
              mb: 2, 
              bgcolor: '#2d5a27',
              fontSize: '2rem',
              border: '3px solid #2d5a27'
            }}
          >
            {idoso.nome.charAt(0)}
          </Avatar>

          <Typography variant="h6" sx={{ color: '#1a3d0a', fontWeight: 'bold', mb: 4 }}>
            {idoso.nome}
          </Typography>

          <Grid container spacing={3}>
            
            {/* CARD TEMPERATURA */}
            <Grid item xs={12} sm={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: '#f1f8e9', 
                  border: '1px solid #c5e1a5', 
                  borderRadius: 3 
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                    <DeviceThermostatIcon sx={{ color: '#2d5a27', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ color: '#2d5a27', fontWeight: 'bold' }}>
                      Temperatura
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: '#1a3d0a', fontWeight: 'bold' }}>
                    {idoso.temperatura} °C
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* CARD BPM */}
            <Grid item xs={12} sm={6}>
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: '#ffebee', 
                  border: '1px solid #ef9a9a', 
                  borderRadius: 3 
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                    <FavoriteIcon sx={{ color: '#d32f2f', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                      BPM
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: '#b71c1c', fontWeight: 'bold' }}>
                    {idoso.bpm}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Paper>
      )}

    </Box>
  );
}