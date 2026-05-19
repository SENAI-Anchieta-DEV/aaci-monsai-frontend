import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Importação obrigatória do CSS do Leaflet
import 'leaflet/dist/leaflet.css';

// Correção para os ícones padrão do Leaflet no React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-componente para centralizar o mapa quando a posição mudar
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function LocalizarIdoso() {
  const [position, setPosition] = useState([-23.5505, -46.6333]); // Padrão: São Paulo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          console.error("Erro ao obter localização:", err);
          setError("Não foi possível acessar sua localização real. Exibindo local padrão.");
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocalização não suportada pelo seu navegador.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#2d5a27' }} />
        <Typography sx={{ mt: 2, color: '#2d5a27' }}>Carregando mapa...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1a3d0a', fontWeight: 'bold' }}>
        Localizar Idoso
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              <b>Localização Atual</b> <br /> 
              O dispositivo está operando nesta área.
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