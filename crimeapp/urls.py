from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .face_views import add_criminal_face, search_by_face, reencode_all_faces
from .views import (
    CriminalViewSet,
    PoliceStationViewSet,
    FIRViewSet,
    CourtViewSet,
    CaseRecordViewSet,
    CaseCriminalViewSet,
    find_criminal_page,
    user_me,
    statistics_summary,
)

router = DefaultRouter()
router.register(r'criminals', CriminalViewSet, basename='criminal')
router.register(r'police_stations', PoliceStationViewSet, basename='policestation')
router.register(r'firs', FIRViewSet, basename='fir')
router.register(r'courts', CourtViewSet, basename='court')
router.register(r'case_records', CaseRecordViewSet, basename='caserecord')
router.register(r'case_criminals', CaseCriminalViewSet, basename='casecriminal')

urlpatterns = [
    path('', include(router.urls)),  
    path('me/', user_me, name='user_me'),
    path('statistics/', statistics_summary, name='statistics_summary'),
    path('find_criminal_page/', find_criminal_page, name='find_criminal_page'),
    path('add-criminal-face/<int:criminal_id>/', add_criminal_face, name='add_criminal_face'),
    path('search-by-face/', search_by_face, name='search_by_face'),
    path('reencode-faces/', reencode_all_faces, name='reencode_all_faces'),
]
