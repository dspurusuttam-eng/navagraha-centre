"""Card 11.R1 — kernel provenance/verification (INTERNAL VALIDATION ONLY).

Verifies the locally-cached JPL DE440s kernel: existence, size, SHA-256, and the
covered date range read from the SPK segments. Never networked at runtime; never
bundled into the production application.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.dirname(HERE)
KERNEL = os.path.join(LAB, "cache", "de440s.bsp")

# Recorded provenance (verified this phase).
EXPECTED = {
    "source": "https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440s.bsp",
    "expectedSizeBytes": 32726016,
    "sha256": "c1c7feeab882263fc493a9d5a5b2ddd71b54826cdf65d8d17a76126b260a49f2",
    "documentedRange": "1849-12-26 .. 2150-01-22",
    "license": "US Government work (NASA/JPL) — public domain; validation-only, not redistributed in production",
}


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def verify() -> dict:
    if not os.path.exists(KERNEL):
        raise FileNotFoundError(f"DE440s kernel missing at {KERNEL}. Acquire from {EXPECTED['source']}.")
    size = os.path.getsize(KERNEL)
    digest = sha256_of(KERNEL)
    # Read covered range from the SPK segments.
    from jplephem.spk import SPK

    spk = SPK.open(KERNEL)
    jd_min = min(seg.start_jd for seg in spk.segments)
    jd_max = max(seg.end_jd for seg in spk.segments)
    spk.close()
    result = {
        "path": KERNEL,
        "sizeBytes": size,
        "sizeMatches": size == EXPECTED["expectedSizeBytes"],
        "sha256": digest,
        "sha256Matches": digest == EXPECTED["sha256"],
        "coveredJdStart": jd_min,
        "coveredJdEnd": jd_max,
        "expected": EXPECTED,
    }
    if not result["sha256Matches"]:
        raise ValueError(
            f"KERNEL CHECKSUM MISMATCH. got {digest} expected {EXPECTED['sha256']}. Refusing to proceed."
        )
    return result


if __name__ == "__main__":
    print(json.dumps(verify(), indent=2))
