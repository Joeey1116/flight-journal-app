#!/usr/bin/env python3
"""Deploy the flight-journal Worker with wrangler using the stored
custom.cloudflare API token via its surrogate.

Mirrors the store's deploy-prod.py pattern: the surrogate (hsurr:...)
is placed in CLOUDFLARE_API_TOKEN for the wrangler child process only.
The runtime swaps it for the real token on requests to
api.cloudflare.com. The real token value never appears in code, args,
env dumps, or logs, and this script never prints the surrogate.
"""
import os
import sys

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import dynamic_credential_entry

entry = dynamic_credential_entry("custom.cloudflare")
surrogate = str(entry["surrogate"]).strip()
if not surrogate.startswith("hsurr:"):
    raise SystemExit("authd returned a non-surrogate value")

env = dict(os.environ)
env["CLOUDFLARE_API_TOKEN"] = surrogate
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.execvpe("npx", ["npx", "wrangler", "deploy"], env)
