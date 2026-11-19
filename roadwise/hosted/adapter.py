"""Browser transport for the shared Python application service."""
import json
from urllib.parse import urlencode

from js import roadwise_http

from planner import providers, service


def browser_json(url, params, name):
    try:
        status, text = json.loads(roadwise_http(url + "?" + urlencode(params)))
        if status == 400 and name == "Routing":
            if json.loads(text).get("code") in {"NoRoute", "NoSegment"}:
                raise providers.ProviderError("No connected road route was found.", 422)
        if status < 200 or status >= 300:
            raise providers.ProviderError(f"{name} service returned HTTP {status}. Try again later.")
        return json.loads(text)
    except providers.ProviderError:
        raise
    except Exception as error:
        raise providers.ProviderError(f"{name} service could not be reached. Try again later.", 503) from error


providers._json = browser_json
# The worker has its own execution thread; the WASM build cannot spawn native
# thread pools. Sequential batches still retain provider caches between requests.
providers._map_batches = map


def plan_json(payload):
    try:
        result = service.compute(json.loads(payload))
    except (service.InputError, providers.ProviderError) as error:
        return json.dumps({"error": str(error)})
    return json.dumps({"plan": result}, allow_nan=False)
