import json
import logging
from functools import lru_cache

from django.core.exceptions import RequestDataTooBig
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from . import service
from .providers import ProviderError

log = logging.getLogger(__name__)


def respond(payload, status=200):
    return JsonResponse(payload, status=status, json_dumps_params={"allow_nan":False, "separators":(",", ":")})


@require_GET
def health(request):
    return respond({"status":"ok"})


@lru_cache(maxsize=1)
def demonstration():
    return service.compute(service.fixture_request())


@require_GET
def demo_view(request):
    return respond(demonstration())


def calculate(request, fuel_only=False):
    if request.content_type != "application/json":
        return respond({"error":"Send a JSON object with Content-Type application/json."}, 415)
    try:
        data = json.loads(request.body)
        if not isinstance(data, dict):
            raise service.InputError("Expected a JSON object.")
        return respond(service.compute(data, fuel_only))
    except RequestDataTooBig:
        return respond({"error":"Request exceeds the 16 KB limit."}, 413)
    except (json.JSONDecodeError, UnicodeDecodeError, service.InputError) as exc:
        return respond({"error":str(exc)}, 400)
    except ProviderError as exc:
        log.info("Provider request failed: %s", exc)
        return respond({"error":str(exc)}, exc.status)


@require_POST
def plan(request):
    return calculate(request)


@require_POST
def fuel_view(request):
    return calculate(request, fuel_only=True)
