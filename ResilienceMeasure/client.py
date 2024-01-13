from __future__ import print_function

import logging

import grpc
import ResilienceMeasure_pb2
import ResilienceMeasure_pb2_grpc


def run():
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = ResilienceMeasure_pb2_grpc.ResilienceMeasureStub(channel)
        response = stub.RunDynamicMeasure(ResilienceMeasure_pb2.DynamicMeasureRequest(data="{\"test\": 1}"))
    return("Dynamic measurer called: " + response.message)


if __name__ == "__main__":
    logging.basicConfig()
    run()
