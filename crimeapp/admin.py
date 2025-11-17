from django.contrib import admin
from .models import Criminal, PoliceStation, FIR, Court, CaseRecord, CaseCriminal

def in_group(user, group_name):
    return user.is_authenticated and user.groups.filter(name=group_name).exists()
# FIR Admin (Police + Admin)

@admin.register(FIR)
class FIRAdmin(admin.ModelAdmin):
    list_display = ('fir_id', 'crime_type', 'date_registered', 'status', 'station')
    search_fields = ('fir_id', 'crime_type', 'status')

    def has_module_permission(self, request):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

# Criminal Admin (Police + Admin)
@admin.register(Criminal)
class CriminalAdmin(admin.ModelAdmin):
    list_display = ('criminal_id', 'first_name', 'last_name', 'gender', 'aadhaar_number')
    search_fields = ('first_name', 'last_name', 'aadhaar_number')

    def has_module_permission(self, request):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Police')

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


# CaseRecord Admin (Court + Admin)

@admin.register(CaseRecord)
class CaseRecordAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'fir', 'court', 'status', 'verdict', 'start_date')
    search_fields = ('case_id', 'status', 'verdict')

    def has_module_permission(self, request):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Court')

    def has_view_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Court')

    def has_add_permission(self, request):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Court')

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return in_group(request.user, 'Court')

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


# Court Admin (Admin only)
@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ('court_id', 'court_name', 'court_type', 'city')
    search_fields = ('court_name', 'city')


# PoliceStation Admin (Admin only)
@admin.register(PoliceStation)
class PoliceStationAdmin(admin.ModelAdmin):
    list_display = ('station_id', 'station_name', 'city', 'contact_number')
    search_fields = ('station_name', 'city')


# CaseCriminal Admin (Admin only)
@admin.register(CaseCriminal)
class CaseCriminalAdmin(admin.ModelAdmin):
    list_display = ('case_criminal_id', 'case', 'criminal', 'role_in_case')
    search_fields = ('role_in_case',)
