#!/usr/bin/env python3
"""Attach flightjournal.beatrackfam.info as a Workers Custom Domain for
the flight-journal Worker.

Uses the stored custom.cloudflare credential (surrogate exchange; the
real token never appears in code, args, env, or logs). Prints API
results as JSON. Exits non-zero with the API error body on failure.
"""
import json
import sys
import urllib.error
import urllib.request

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

HOSTNAME = "flightjournal.beatrackfam.info"
SERVICE = "flight-journal"
ZONE_NAME = "beatrackfam.info"
API = "https://api.cloudflare.com/client/v4"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise RuntimeError("redirect refused, verify the endpoint")


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(API + path, data=data, method=method)
    if data is not None:
        request.add_header("Content-Type", "application/json")
    add_surrogate_to_request(
        request, "custom.cloudflare", allowed_hosts=["api.cloudflare.com"]
    )
    try:
        with urllib.request.build_opener(NoRedirect()).open(
            request, timeout=30
        ) as response:
            return response.status, read_json_response(response)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw}
        return e.code, payload


def main() -> int:
    status, zones = call("GET", f"/zones?name={ZONE_NAME}")
    print(f"GET /zones -> HTTP {status}")
    if status != 200 or not zones.get("success") or not zones.get("result"):
        print(json.dumps(zones, indent=2))
        return 1
    zone_id = zones["result"][0]["id"]
    print(f"zone {ZONE_NAME} id: {zone_id}")

    status, existing = call("GET", f"/zones/{zone_id}/workers/domains")
    if status == 200 and existing.get("success"):
        for d in existing.get("result") or []:
            if d.get("hostname") == HOSTNAME:
                print(f"domain already attached: {json.dumps(d)}")
                return 0

    status, result = call(
        "PUT",
        f"/zones/{zone_id}/workers/domains",
        {"hostname": HOSTNAME, "service": SERVICE, "environment": "production"},
    )
    print(f"PUT /zones/{{zone_id}}/workers/domains -> HTTP {status}")
    print(json.dumps(result, indent=2))
    return 0 if status in (200, 201) and result.get("success") else 1


if __name__ == "__main__":
    raise SystemExit(main())
