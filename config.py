"""Configuration from environment variables with defaults."""

import os


def _bool(val):
    return str(val).lower() in ("1", "true", "yes", "on")


def _int(val, default):
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


# RTL-SDR
FM_FREQUENCY = os.environ.get("FM_FREQUENCY", "103.5M")
RTL_GAIN = os.environ.get("RTL_GAIN", "8")
PPM_CORRECTION = os.environ.get("PPM_CORRECTION", "0")
RTL_DEVICE_SERIAL = os.environ.get("RTL_DEVICE_SERIAL", "")
RTL_DEVICE_INDEX = os.environ.get("RTL_DEVICE_INDEX", "0")

# Redsea
REDSEA_SHOW_PARTIAL = _bool(os.environ.get("REDSEA_SHOW_PARTIAL", "true"))
REDSEA_SHOW_RAW = _bool(os.environ.get("REDSEA_SHOW_RAW", "false"))

# MQTT
MQTT_ENABLED = _bool(os.environ.get("MQTT_ENABLED", "false"))
MQTT_HOST = os.environ.get("MQTT_HOST", "")
MQTT_PORT = _int(os.environ.get("MQTT_PORT"), 1883)
MQTT_USER = os.environ.get("MQTT_USER", "")
MQTT_PASSWORD = os.environ.get("MQTT_PASSWORD", "")
MQTT_TOPIC_PREFIX = os.environ.get("MQTT_TOPIC_PREFIX", "rds")
MQTT_CLIENT_ID = os.environ.get("MQTT_CLIENT_ID", "rds-guard")
MQTT_QOS = _int(os.environ.get("MQTT_QOS"), 1)
MQTT_RETAIN_STATE = _bool(os.environ.get("MQTT_RETAIN_STATE", "true"))

# Publishing control
#   "essential" = only traffic (TA/TP), RadioText, PTY changes, and EON TA
#   "all"       = every decoded RDS field gets its own topic
PUBLISH_MODE = os.environ.get("PUBLISH_MODE", "essential").lower()
PUBLISH_RAW = _bool(os.environ.get("PUBLISH_RAW", "false"))
STATUS_INTERVAL = _int(os.environ.get("STATUS_INTERVAL"), 30)

# Web UI
WEB_UI_PORT = _int(os.environ.get("WEB_UI_PORT"), 8022)
EVENT_RETENTION_DAYS = _int(os.environ.get("EVENT_RETENTION_DAYS"), 30)
