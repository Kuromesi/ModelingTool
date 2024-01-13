import yaml

def read_config() -> dict:
    config = yaml.safe_load(open("config/config.yaml"))
    return config

CONFIG = read_config()