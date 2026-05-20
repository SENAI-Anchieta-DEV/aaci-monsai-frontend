import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Importação do CSS e Ícones do Leaflet
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Importação do seu Contexto de Toast (ajuste o caminho se necessário)
import { useToast } from '../components/ToastContext'; 

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function LocalizarIdoso() {
  const [position, setPosition] = useState([-23.5505, -46.6333]); 
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false); // Novo estado para permissão negada
  const showToast = useToast(); 

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
          setDenied(false);

          // CORREÇÃO NA CHAMADA: Passando o objeto que o seu Provider espera
          showToast({ 
            title: "Sucesso!", 
            message: "Localização obtida com sucesso.", 
            type: "success" 
          });
        },
        (err) => {
          setLoading(false);
          if (err.code === 1) {
            setDenied(true);
            showToast({ 
              title: "Acesso Negado", 
              message: "Você precisa permitir o GPS.", 
              type: "error" 
            });
          } else {
            showToast({ 
              title: "Erro", 
              message: "Não conseguimos carregar o mapa.", 
              type: "info" 
            });
          }
        },
        { enableHighAccuracy: true }
      );
    }
  }, [showToast]);

  // Se estiver carregando, mostra o spinner
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#2d5a27' }} />
        <Typography sx={{ mt: 2, color: '#2d5a27' }}>Carregando mapa...</Typography>
      </Box>
    );
  }

  // Se a localização foi negada, mostra a mensagem de erro no lugar do mapa
  if (denied) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, p: 3 }}>
        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold', textAlign: 'center' }}>
          Localização não aceita
        </Typography>
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
          Para ver o idoso no mapa, você precisa permitir o acesso à localização nas configurações do seu navegador.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
        Localizar Idoso
      </Typography>

      <Paper 
        elevation={2} 
        sx={{ 
          height: '70vh', 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: '1px solid #e0e0e0' 
        }}
      >
        <MapContainer 
          center={position} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <b>Localização Atual</b> <br /> 
              O dispositivo está nesta área.
            </Popup>
          </Marker>
          <ChangeView center={position} />
        </MapContainer>
      </Paper>
      
      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary', textAlign: 'center' }}>
        Coordenadas: {position[0].toFixed(5)}, {position[1].toFixed(5)}
      </Typography>
    </Box>
  );
}