from rest_framework import serializers
from .models import Criminal, PoliceStation, FIR, Court, CaseRecord, CaseCriminal

class CriminalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criminal
        fields = '__all__'

class PoliceStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceStation
        fields = '__all__'

class FIRSerializer(serializers.ModelSerializer):
    station_name = serializers.CharField(source='station.station_name', read_only=True)
    
    class Meta:
        model = FIR
        fields = ['fir_id', 'station', 'station_name', 'date_registered', 'crime_type', 
                 'incident_location', 'status', 'details']

class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Court
        fields = '__all__'

class CaseRecordSerializer(serializers.ModelSerializer):
    fir_id_display = serializers.IntegerField(source='fir.fir_id', read_only=True)
    court_name = serializers.CharField(source='court.court_name', read_only=True)
    
    class Meta:
        model = CaseRecord
        fields = ['case_id', 'fir', 'fir_id_display', 'court', 'court_name', 
                 'start_date', 'status', 'verdict']

class CaseCriminalSerializer(serializers.ModelSerializer):
    criminal_name = serializers.CharField(source='criminal.first_name', read_only=True)
    criminal_full_name = serializers.SerializerMethodField()
    case_id_display = serializers.IntegerField(source='case.case_id', read_only=True)
    
    class Meta:
        model = CaseCriminal
        fields = ['case_criminal_id', 'case', 'case_id_display', 'criminal', 
                 'criminal_name', 'criminal_full_name', 'role_in_case']
    
    def get_criminal_full_name(self, obj):
        return f"{obj.criminal.first_name} {obj.criminal.last_name}"