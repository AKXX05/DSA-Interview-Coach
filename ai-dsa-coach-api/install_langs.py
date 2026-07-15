import urllib.request
import json

languages = ["gcc"]

print("Connecting to local Piston API...")
try:
    req = urllib.request.Request("http://127.0.0.1:2000/api/v2/packages")
    with urllib.request.urlopen(req) as response:
        packages = json.loads(response.read().decode())
except Exception as e:
    print(f"Could not connect. Is Docker running? Error: {e}")
    exit(1)

for lang in languages:
    # Filter the available packages for the language we want
    versions = [p["language_version"] for p in packages if p["language"] == lang]
    if not versions:
        print(f"❌ Could not find {lang}")
        continue
        
    latest = versions[-1] # Grab the newest version
    print(f"⬇️ Downloading {lang} v{latest} inside Docker (this takes a minute)...")
    
    # Send the POST request to the API to install it
    payload = json.dumps({"language": lang, "version": latest}).encode('utf-8')
    install_req = urllib.request.Request(
        "http://127.0.0.1:2000/api/v2/packages",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(install_req) as res:
            print(f"✅ Successfully installed {lang}!")
    except Exception as e:
        print(f"❌ Failed to install {lang}: {e}")

print("\nPiston is fully loaded and ready!")