import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

# Variável global para controlar quando enviar a anomalia
contador_envios = 0

def gerar_telemetria(is_anomalia):
    # Se for anomalia, força valores críticos. Se não, gera valores saudáveis.
    bpm = random.randint(140, 160) if is_anomalia else random.randint(65, 85)
    temp = round(random.uniform(39.5, 41.0), 1) if is_anomalia else round(random.uniform(35.5, 37.2), 1)
    queda = True if is_anomalia and random.choice([True, False]) else False

    return {
        "idoso_id": 2,
        "pulseira_id": "MON-313", # Ajuste para o serial que está no seu banco
        "data_hora": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "sinal_vital": {
            "sinal_vital_id": "SV-999",
            "frequencia_cardiaca_bpm": bpm,
            "temperatura_c": temp,
            "movimento": {
                "aceleracao": {"x": 0.0, "y": 0.0, "z": 9.8},
                "queda_detectada": queda
            }
        },
        "localizacao": {
            "latitude": -23.5505, "longitude": -46.6333, "precisao_metro": 2.0
        },
        "status_do_dispositivo": {
            "status_id": "ST-001", "nivel_bateria": 90, "status_pulseira": "ATIVO"
        }
    }

def on_message(client, userdata, msg):
    comando = msg.payload.decode()
    print(f"\nRecebido comando do servidor: {comando}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.subscribe("monsai/comandos")
client.loop_start()

print("Simulador IoT iniciado. Enviando telemetria a cada 5 segundos...")
try:
    while True:
        contador_envios += 1
        # A cada 6 envios (30 segundos), manda uma anomalia
        is_anomalia = (contador_envios % 6 == 0) 
        
        payload = gerar_telemetria(is_anomalia)
        client.publish("monsai/telemetria", json.dumps(payload))
        
        status = "🚨 ALERTA" if is_anomalia else "✅ NORMAL"
        print(f"Enviado [{status}]: {payload['sinal_vital']['frequencia_cardiaca_bpm']} BPM | {payload['sinal_vital']['temperatura_c']}°C")
        
        time.sleep(5) # Delay de 5 segundos
except KeyboardInterrupt:
    print("\nEncerrando simulador...")
    client.loop_stop()
    client.disconnect()