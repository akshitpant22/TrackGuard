import math
import os
import tempfile
import gc

# EXTREME MEMORY OPTIMIZATION FOR RENDER (512MB)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['TF_NUM_INTRAOP_THREADS'] = '1'
os.environ['TF_NUM_INTEROP_THREADS'] = '1'
os.environ['TF_ENABLE_XLA'] = '0'

import tensorflow as tf

from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from django.http import JsonResponse

from .models import Criminal, CaseCriminal, CaseRecord, FIR, Court, PoliceStation
from .supabase_storage import upload_criminal_image


def _extract_embedding(image_file):
    from deepface import DeepFace
    suffix = os.path.splitext(image_file.name)[1] or ".jpg"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in image_file.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        representations = DeepFace.represent(
            img_path=tmp_path,
            model_name="VGG-Face",
            detector_backend="opencv",
            enforce_detection=False,
        )

        if not representations:
            return None

        first = representations[0]
        embedding = first.get("embedding") if isinstance(first, dict) else None
        if not embedding:
            return None

        return embedding
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


def _cosine_distance(vec1, vec2):
    if len(vec1) != len(vec2):
        return None

    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0 or norm2 == 0:
        return None

    return 1 - (dot / (norm1 * norm2))


def _euclidean_distance(vec1, vec2):
    if len(vec1) != len(vec2):
        return None
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(vec1, vec2)))


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def add_criminal_face(request, criminal_id):
    try:
        criminal = Criminal.objects.get(pk=criminal_id)
    except Criminal.DoesNotExist:
        return JsonResponse({"success": False, "error": "Criminal not found"}, status=404)

    image_file = request.FILES.get("image")
    if not image_file:
        return JsonResponse({"success": False, "error": "Image file is required"}, status=400)

    try:
        image_url = upload_criminal_image(image_file, criminal_id)
        image_file.seek(0)
        embedding = _extract_embedding(image_file)

        if embedding is None:
            return JsonResponse({"success": False, "error": "No face encoding generated"}, status=400)

        criminal.image_url = image_url
        criminal.face_encoding = embedding
        criminal.save(update_fields=["image_url", "face_encoding"])

        return JsonResponse(
            {
                "success": True,
                "criminal_id": criminal.criminal_id,
                "image_url": image_url,
            },
            status=200,
        )
    except Exception as exc:
        print(f"CRASH OCCURRED in add_criminal: {str(exc)}")
        return JsonResponse({"success": False, "error": str(exc)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def search_by_face(request):
    image_file = request.FILES.get("image")
    if not image_file:
        return JsonResponse({"success": False, "error": "Image file is required"}, status=400)

    try:
        query_embedding = _extract_embedding(image_file)
        if query_embedding is None:
            print("DEBUG SEARCH: Failed to extract embedding from the uploaded image! No face detected.")
            return JsonResponse({"success": False, "error": "No face encoding generated"}, status=400)

        best_match = None
        best_distance = None

        criminals = Criminal.objects.exclude(face_encoding__isnull=True)
        for criminal in criminals:
            stored_embedding = criminal.face_encoding
            if not isinstance(stored_embedding, list):
                continue

            if len(stored_embedding) != len(query_embedding):
                continue

            distance = _cosine_distance(query_embedding, stored_embedding)
            if distance is None:
                continue

            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_match = criminal

        COSINE_THRESHOLD = 0.85
        if best_match is None or best_distance is None or best_distance > COSINE_THRESHOLD:
            print(f"DEBUG SEARCH: Best match was {best_match.first_name if best_match else 'None'} with distance {best_distance}")
            return JsonResponse({"success": True, "match": None, "message": "not found"}, status=200)

        print(f"DEBUG SEARCH: FOUND MATCH! {best_match.first_name} with distance {best_distance}")

        match_data = {
            "criminal_id": best_match.criminal_id,
            "first_name": best_match.first_name,
            "last_name": best_match.last_name,
            "dob": str(best_match.dob),
            "gender": best_match.gender,
            "address": best_match.address,
            "aadhaar_number": best_match.aadhaar_number,
            "image_url": best_match.image_url,
            "distance": best_distance,
            "cases": [],
        }

        case_links = CaseCriminal.objects.filter(criminal_id=best_match.criminal_id)
        for link in case_links:
            case_record = CaseRecord.objects.filter(case_id=link.case_id).first()
            if not case_record:
                continue

            fir = FIR.objects.filter(fir_id=case_record.fir_id).first()
            court = Court.objects.filter(court_id=case_record.court_id).first()

            station = None
            if fir:
                station = PoliceStation.objects.filter(station_id=fir.station_id).first()

            match_data["cases"].append(
                {
                    "case_id": case_record.case_id,
                    "role_in_case": link.role_in_case,
                    "status": case_record.status,
                    "verdict": case_record.verdict,
                    "start_date": str(case_record.start_date),
                    "crime_type": fir.crime_type if fir else None,
                    "incident_location": fir.incident_location if fir else None,
                    "fir_status": fir.status if fir else None,
                    "court_name": court.court_name if court else None,
                    "station_name": station.station_name if station else None,
                }
            )

        return JsonResponse(
            {
                "success": True,
                "match": match_data,
            },
            status=200,
        )
    except Exception as exc:
        print(f"CRASH OCCURRED: {str(exc)}")
        return JsonResponse({"success": False, "error": str(exc)}, status=500)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def reencode_all_faces(request):
    try:
        import requests as req
        from deepface import DeepFace

        criminals = Criminal.objects.exclude(image_url__isnull=True).exclude(image_url='')
        updated = 0
        failed = []

        for criminal in criminals:
            try:
                resp = req.get(criminal.image_url, timeout=15)
                if resp.status_code != 200:
                    failed.append({"id": criminal.criminal_id, "error": f"Download failed: {resp.status_code}"})
                    continue

                suffix = ".png" if ".png" in criminal.image_url.lower() else ".jpg"
                tmp_path = None
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    tmp.write(resp.content)
                    tmp_path = tmp.name

                try:
                    representations = DeepFace.represent(
                        img_path=tmp_path,
                        model_name="VGG-Face",
                        detector_backend="opencv",
                        enforce_detection=False,
                    )

                    if representations:
                        embedding = representations[0].get("embedding")
                        if embedding:
                            criminal.face_encoding = embedding
                            criminal.save(update_fields=["face_encoding"])
                            updated += 1
                        else:
                            failed.append({"id": criminal.criminal_id, "error": "No embedding extracted"})
                    else:
                        failed.append({"id": criminal.criminal_id, "error": "No face detected"})
                finally:
                    if tmp_path and os.path.exists(tmp_path):
                        os.remove(tmp_path)

            except Exception as e:
                failed.append({"id": criminal.criminal_id, "error": str(e)})
            
            # FORCE MEMORY CLEAR AFTER EVERY IMAGE
            tf.keras.backend.clear_session()
            gc.collect()

        return JsonResponse({
            "success": True,
            "updated": updated,
            "failed_count": len(failed),
            "failed": failed[:10],
        })
    except Exception as exc:
        return JsonResponse({"success": False, "error": str(exc)}, status=500)