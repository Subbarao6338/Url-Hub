import datetime
import random


def generate_telemetry():
    # Ported logic from device_events_simulator.py
    # Generates realistic device telemetry based on common patterns
    devices = ["Sensor_A", "Sensor_B", "Pump_01", "Valve_02"]
    data = []
    for d in devices:
        data.append({
            "device_id": d,
            "timestamp": str(datetime.datetime.now(datetime.timezone.utc)),
            "temperature": round(random.uniform(20.0, 100.0), 2),
            "humidity": round(random.uniform(30.0, 90.0), 2),
            "status": "online" if random.random() > 0.1 else "warning"
        })
    return data
