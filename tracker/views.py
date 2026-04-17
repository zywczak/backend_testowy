import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import DomainEntry

@csrf_exempt
def track_domain(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            domain_name = data.get("domain_name")
            
            if not domain_name:
                return JsonResponse({"error": "domain_name is required"}, status=400)
                
            ip = request.META.get("HTTP_CF_CONNECTING_IP") or request.META.get("REMOTE_ADDR")
            
            entry = DomainEntry.objects.create(
                domain_name=domain_name,
                ip_address=ip
            )
            
            return JsonResponse({"status": "ok", "domain": domain_name, "ip": ip}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_entries(request):
    if request.method == "GET":
        entries = list(DomainEntry.objects.values("id", "domain_name", "ip_address", "created_at"))
        return JsonResponse(entries, safe=False)
    return JsonResponse({"error": "Method not allowed"}, status=405)

