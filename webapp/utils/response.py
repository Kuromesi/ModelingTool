# from flask import Response as fResponse

SUCCESS_CODE = 200
ERROR_CODE = 500

# class Response(fResponse):
#     def __init__(self, data, status=SUCCESS_CODE, headers=None, mimetype='application/json'):
#         super().__init__(data, status, headers, mimetype)

class Response():
    def __init__(self, status: int, msg="", **kwargs):
        self.status = status
        self.msg = msg
        self.kwargs = kwargs
        self.msg = ""

    def get_response(self):
        response = {
            'status': self.status,
            'msg': self.msg,
        }
        for k, v in self.kwargs.items():
            response[k] = v
        return response