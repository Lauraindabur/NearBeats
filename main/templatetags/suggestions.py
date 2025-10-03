from django import template
from library.models import Song
import random

register = template.Library()


@register.simple_tag
def get_suggested_songs(limit=3):
    """Devuelve hasta `limit` canciones aleatorias como lista de diccionarios ligeros."""
    try:
        ids = list(Song.objects.values_list('id', flat=True))
        if not ids:
            return []
        sample_ids = random.sample(ids, min(limit, len(ids)))
        qs = Song.objects.filter(id__in=sample_ids)
        result = []
        for s in qs:
            result.append({
                'id': s.id,
                'title': s.title,
                'artist': s.artist_name,
                'cover': s.cover_image.url if s.cover_image else None,
            })
        return result
    except Exception:
        return []
