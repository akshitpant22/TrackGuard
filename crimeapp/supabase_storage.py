import os
from supabase import create_client
from django.conf import settings


def get_supabase_client():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def upload_criminal_image(file, criminal_id):
    supabase = get_supabase_client()
    file_ext = file.name.split('.')[-1]
    file_path = f"criminals/{criminal_id}.{file_ext}"
    file_bytes = file.read()
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        file_path,
        file_bytes,
        {"content-type": file.content_type, "upsert": "true"}
    )
    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(file_path)
    return public_url


def delete_criminal_image(criminal_id, file_ext):
    supabase = get_supabase_client()
    file_path = f"criminals/{criminal_id}.{file_ext}"
    supabase.storage.from_(settings.SUPABASE_BUCKET).remove([file_path])
