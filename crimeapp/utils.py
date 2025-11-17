from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler that converts masked 404s into real 403s.
    """
    response = exception_handler(exc, context)

    if response is None:
        return Response({'detail': 'Unexpected error occurred.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    if response.status_code == 404 and 'detail' in response.data and response.data['detail'] == 'Not found.':
        response.data['detail'] = 'Permission Denied (403): You are not allowed to access this resource.'
        response.status_code = 403

    return response
