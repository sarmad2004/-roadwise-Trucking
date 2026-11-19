"""Build the static edition, using the same Python planner as Django."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import shutil
import sys
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_URL = "https://registry.npmjs.org/pyodide/-/pyodide-0.27.7.tgz"
RUNTIME_SHA256 = "89d5d952675eb08e11286e52c7238f1248ce71726e896db9703e73bef23dc343"
RUNTIME_FILES = (
    "pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm",
    "pyodide-lock.json", "python_stdlib.zip",
)
PYTHON_FILES = (
    "planner/__init__.py", "planner/demo.py", "planner/fuel.py",
    "planner/providers.py", "planner/risk.py", "planner/service.py",
)


def package_planner(target):
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as code:
        for name in PYTHON_FILES:
            code.write(ROOT / name, name)
        code.write(ROOT / "hosted" / "adapter.py", "adapter.py")
        for name in ("prices.csv", "station_locations.csv"):
            code.write(ROOT / "data" / name, "data/" + name)


def build(output, archive_path=None):
    source = ROOT / "web"
    output.mkdir(parents=True, exist_ok=True)
    hosted = output / "hosted"
    runtime = hosted / "python"
    runtime.mkdir(parents=True, exist_ok=True)
    if archive_path is None:
        with urllib.request.urlopen(RUNTIME_URL, timeout=45) as response:
            blob = response.read()
    else:
        blob = archive_path.read_bytes()
    if hashlib.sha256(blob).hexdigest() != RUNTIME_SHA256:
        raise ValueError("Pyodide distribution checksum mismatch")
    with tarfile.open(fileobj=io.BytesIO(blob)) as archive:
        for file in RUNTIME_FILES:
            with archive.extractfile("package/" + file) as src, (runtime / file).open("wb") as dest:
                shutil.copyfileobj(src, dest)

    for name in ("bridge.js", "planner-worker.js", "PYODIDE-LICENSE.txt"):
        shutil.copy2(ROOT / "hosted" / name, hosted / name)
    package_planner(hosted / "planner.zip")

    shutil.copytree(source / "assets", output / "assets", dirs_exist_ok=True)
    shutil.copy2(source / "style.css", output / "style.css")
    shutil.copy2(ROOT / "walkthrough" / "roadwise-walkthrough.mp4", output / "walkthrough.mp4")
    # Generate the initial page payload from the same dataset and code that
    # later recalculate routes and fuel purchases inside the web worker.
    sys.path.insert(0, str(ROOT))
    from planner.service import compute, fixture_request
    with (output / "demo.json").open("w") as fixture:
        json.dump(compute(fixture_request()), fixture, separators=(",", ":"), allow_nan=False)
    index = (source / "index.html").read_text()
    if "<head>" not in index:
        raise ValueError("Frontend HTML head missing.")
    index = index.replace("<head>", '<head>\n<script src="./hosted/bridge.js"></script>', 1)
    (output / "index.html").write_text(index)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=ROOT / "dist")
    parser.add_argument("--runtime-archive", type=Path, help="Use the pinned npm tarball already on disk.")
    args = parser.parse_args()
    build(args.out, args.runtime_archive)
