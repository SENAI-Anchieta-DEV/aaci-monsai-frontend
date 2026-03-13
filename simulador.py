import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

# 1. FUNÇÃO GERADORA DE DADOS (Obrigatória antes de ser chamada)
def gerar_telemetria_valida():
    return {
        "idoso_id": 1,
        "pulseira_id": "PULSEIRA-001",
        "data_hora": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "sinal_vital": {
            "sinal_vital_id": "SV-999",
            "frequencia_cardiaca_bpm": 72,
            "temperatura_c": round(random.uniform(35.5, 37.5), 1),
            "movimento": {
                "aceleracao": {"x": 0.0, "y": 0.0, "z": 9.8},
                "queda_detectada": False
            }
        },
        "localizacao": {
            "latitude": -23.5505,
            "longitude": -46.6333,
            "precisao_metro": 2.0
        },
        "status_do_dispositivo": {
            "status_id": "ST-001",
            "nivel_bateria": 90,
            "status_pulseira": "ATIVO"
        }
    }

# 2. CALLBACK DE COMANDOS (Escuta o Java)
def on_message(client, userdata, msg):
    comando = msg.payload.decode()
    print(f"\nRecebido comando do servidor: {comando}")
    if comando == "LIGAR_LED":
        print("💡 LED ACESO NO HARDWARE VIRTUAL!")

# 3. CONFIGURAÇÃO DO CLIENTE
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.subscribe("monsai/comandos")
client.loop_start()

# 4. LOOP PRINCIPAL
print("Simulador iniciado. Enviando telemetria...")
try:
    while True:
        payload = gerar_telemetria_valida()
        client.publish("monsai/telemetria", json.dumps(payload))
        print(f"Enviado: {payload['sinal_vital']['temperatura_c']}°C", end="\r")
        time.sleep(2)
except KeyboardInterrupt:
    print("\nEncerrando simulador...")
    client.loop_stop()
    client.disconnect()