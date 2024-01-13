from concurrent import futures
import time
import grpc
import ResilienceMeasure_pb2_grpc
import ResilienceMeasure_pb2
import os

class Measurer(ResilienceMeasure_pb2_grpc.ResilienceMeasureServicer):
    def RunDynamicMeasure(self, request, context):
        return ResilienceMeasure_pb2.DynamicMeasureReply(message = 'hello {msg}'.format(msg = request.data))

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ResilienceMeasure_pb2_grpc.add_ResilienceMeasureServicer_to_server(Measurer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        while True:
            time.sleep(60*60*24) # one day in seconds
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()