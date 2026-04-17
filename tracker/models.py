from django.db import models
from django.utils import timezone

class DomainEntry(models.Model):
    domain_name = models.CharField(max_length=255)
    ip_address = models.CharField(max_length=45)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "domain_entries"
