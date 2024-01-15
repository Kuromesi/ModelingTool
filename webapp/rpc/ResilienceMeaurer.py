import grpc
from protos.ResilienceMeasure import (
        ResilienceMeasureStub, DynamicMeasureRequest
    )
from config.config import CONFIG

class ResilienceMeasurer():
    def run_dynamic_measure(self):
        with grpc.insecure_channel(f"{CONFIG['server']['ip']}:{CONFIG['server']['port']}") as channel:
            stub = ResilienceMeasureStub(channel)
            response = stub.RunDynamicMeasure(DynamicMeasureRequest(measureType=1, data="{\"test\": 1}"))
        return("Dynamic measurer called: " + response.message)
