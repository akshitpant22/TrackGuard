from django.db import models

class Criminal(models.Model):
    criminal_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField()
    gender = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    aadhaar_number = models.CharField(max_length=20)
    image_url = models.TextField(blank=True, null=True)
    face_encoding = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'criminals'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class PoliceStation(models.Model):
    station_id = models.IntegerField(primary_key=True)
    station_name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    jurisdiction_area = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'police_stations'

    def __str__(self):
        return self.station_name


class FIR(models.Model):
    fir_id = models.IntegerField(primary_key=True)
    station = models.ForeignKey(
        PoliceStation,
        on_delete=models.CASCADE,
        db_column='station_id',
        related_name='firs'
    )
    date_registered = models.DateField()
    crime_type = models.CharField(max_length=255)
    incident_location = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'firs'

    def __str__(self):
        return f"FIR {self.fir_id} - {self.crime_type}"


class Court(models.Model):
    court_id = models.IntegerField(primary_key=True)
    court_name = models.CharField(max_length=255)
    court_type = models.CharField(max_length=100)
    city = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'courts'

    def __str__(self):
        return self.court_name


class CaseRecord(models.Model):
    case_id = models.IntegerField(primary_key=True)
    fir = models.ForeignKey(
        FIR,
        on_delete=models.CASCADE,
        db_column='fir_id',
        related_name='case_records'
    )

    court = models.ForeignKey(
        Court,
        on_delete=models.CASCADE,
        db_column='court_id',
        related_name='case_records'
    )
    start_date = models.DateField()
    status = models.CharField(max_length=100)
    verdict = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'case_records'

    def __str__(self):
        return f"Case {self.case_id} - {self.status}"


class CaseCriminal(models.Model):
    case_criminal_id = models.IntegerField(primary_key=True)

    case = models.ForeignKey(
        CaseRecord,
        on_delete=models.CASCADE,
        db_column='case_id',
        related_name='case_criminals'
    )
    
    criminal = models.ForeignKey(
        Criminal,
        on_delete=models.CASCADE,
        db_column='criminal_id',
        related_name='case_criminals'
    )
    role_in_case = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'case_criminals'

    def __str__(self):
        return f"{self.criminal} - {self.role_in_case}"
