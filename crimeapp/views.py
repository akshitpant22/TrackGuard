import traceback
from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import Group

from .models import Criminal, PoliceStation, FIR, Court, CaseRecord, CaseCriminal
from .serializers import (
    CriminalSerializer, PoliceStationSerializer, FIRSerializer,
    CourtSerializer, CaseRecordSerializer, CaseCriminalSerializer
)

def is_admin(user):
    return user.is_superuser

def is_police(user):
    return user.groups.filter(name__iexact='police').exists()

def is_court(user):
    return user.groups.filter(name__iexact='court').exists()

class RolePermissionMixin:
    """Dynamic per-role CRUD/view permissions."""
    def get_permissions(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return [permissions.IsAuthenticated()]

        # Admin 
        if is_admin(user):
            return [permissions.IsAuthenticated()]

        # Police 
        if is_police(user):
            if isinstance(self, (CriminalViewSet, FIRViewSet, CaseCriminalViewSet)):
        
                return [permissions.IsAuthenticated()]
            elif isinstance(self, (PoliceStationViewSet, CaseRecordViewSet, CourtViewSet)):
    
                if self.request.method in permissions.SAFE_METHODS:
                    return [permissions.IsAuthenticated()]
                else:
                    return [permissions.IsAdminUser()] 
            else:
                return [permissions.IsAuthenticated()]

        # Court
        if is_court(user):
            if isinstance(self, (CaseRecordViewSet,)):
        
                return [permissions.IsAuthenticated()]
            elif isinstance(self, (CourtViewSet, CriminalViewSet, FIRViewSet, CaseCriminalViewSet)):
                
                if self.request.method in permissions.SAFE_METHODS:
                    return [permissions.IsAuthenticated()]
                else:
                    return [permissions.IsAdminUser()]
            else:
                
                return [permissions.IsAdminUser()]

    
        return [permissions.IsAuthenticated()]



class CriminalViewSet(RolePermissionMixin, viewsets.ModelViewSet):
    queryset = Criminal.objects.all().order_by('criminal_id')
    serializer_class = CriminalSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['criminal_id']


class PoliceStationViewSet(RolePermissionMixin, viewsets.ModelViewSet):
    queryset = PoliceStation.objects.all().order_by('station_id')
    serializer_class = PoliceStationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['station_id']


class FIRViewSet(RolePermissionMixin, viewsets.ModelViewSet):
    queryset = FIR.objects.all().order_by('fir_id')
    serializer_class = FIRSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['fir_id']


class CourtViewSet(RolePermissionMixin, viewsets.ModelViewSet):
    queryset = Court.objects.all().order_by('court_id')
    serializer_class = CourtSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['court_id']


class CaseRecordViewSet(RolePermissionMixin, viewsets.ModelViewSet):
    queryset = CaseRecord.objects.all().order_by('case_id')
    serializer_class = CaseRecordSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['case_id']


class CaseCriminalViewSet(RolePermissionMixin, viewsets.ModelViewSet):
    queryset = CaseCriminal.objects.all().order_by('case_criminal_id')
    serializer_class = CaseCriminalSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['case_criminal_id']




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_me(request):
    """
    Debug version of user_me — prints exact error cause.
    """
    user = request.user
    try:
        print("🟢 DEBUG: Entered user_me()")
        print("🟢 DEBUG: user =", user)
        print("🟢 DEBUG: user.is_authenticated =", user.is_authenticated)
        print("🟢 DEBUG: user.username =", getattr(user, "username", None))

        groups_qs = user.groups.all()
        print("🟢 DEBUG: user.groups.all() =", groups_qs)

        groups = [g.name.capitalize() for g in groups_qs]
        print("🟢 DEBUG: Parsed groups =", groups)

        if not groups and user.is_superuser:
            groups = ["Admin"]

        print("🟢 DEBUG: Final response groups =", groups)

        return Response({
            "username": user.username,
            "email": user.email,
            "groups": groups,
            "is_superuser": user.is_superuser,
        })

    except Exception as e:
        print("❌ ERROR in user_me():", e)
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistics_summary(request):
    """Fast statistics endpoint for Admin dashboard."""
    data = {
        "totalCriminals": Criminal.objects.count(),
        "totalFIRs": FIR.objects.count(),
        "totalCases": CaseRecord.objects.count(),
        "totalCourts": Court.objects.count(),
        "totalPoliceStations": PoliceStation.objects.count(),
        "totalCaseCriminals": CaseCriminal.objects.count()
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def find_criminal_page(request):
    """
    Given a criminal_id, return which page it appears on.
    Automatically assumes 20 items per page.
    """
    try:
        criminal_id_param = request.query_params.get('id')
        if not criminal_id_param:
            return Response({'error': 'Missing ?id= parameter'}, status=400)

        criminal_id = int(criminal_id_param)
        PAGE_SIZE = 20

        all_ids = list(Criminal.objects.order_by('criminal_id').values_list('criminal_id', flat=True))
        if criminal_id not in all_ids:
            return Response({'page': None, 'message': 'ID not found'}, status=404)

        index = all_ids.index(criminal_id)
        page_number = (index // PAGE_SIZE) + 1
        return Response({'page': page_number})
    except ValueError:
        return Response({'error': 'Invalid ID format. Must be an integer.'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
