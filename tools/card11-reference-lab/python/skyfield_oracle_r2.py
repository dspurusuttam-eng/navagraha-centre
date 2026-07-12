"""Card 11.R2 — Skyfield + DE440s oracle over the golden corpus (VALIDATION ONLY).
Emits per-fixture states, the G1 node sweep (>=1000), and oracle transition instants
for boundary fixtures. No network at runtime; production never imports this."""
from __future__ import annotations

import datetime as dt
import json
import math
import os

import numpy as np
from skyfield.api import load, load_file

from kernel_manifest import verify as verify_kernel

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.dirname(HERE)
FIX = os.path.join(LAB, "fixtures")
REPORTS = os.path.join(LAB, "reports")
KERNEL = os.path.join(LAB, "cache", "de440s.bsp")

SIGN = 30.0
SPANS = {"SIGN": 30.0, "NAKSHATRA": 360.0 / 27.0, "PADA": 360.0 / 108.0, "WRAP_ARIES": 30.0}
LAHIRI_ANCHOR = 23.85709235
BODY = {"SUN": "sun", "MOON": "moon", "MERCURY": "mercury", "VENUS": "venus",
        "MARS": "mars barycenter", "JUPITER": "jupiter barycenter", "SATURN": "saturn barycenter"}
CLASSICAL = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"]


def norm360(x): return x % 360.0
def prec_deg(jd_tt):
    t = (jd_tt - 2451545.0) / 36525.0
    return (5028.796195 * t + 1.1054348 * t * t + 0.00007964 * t ** 3 - 0.000023857 * t ** 4 - 0.0000000383 * t ** 5) / 3600.0
def obl_deg(jd_tt):
    t = (jd_tt - 2451545.0) / 36525.0
    return (84381.448 - 46.8150 * t - 0.00059 * t * t + 0.001813 * t ** 3) / 3600.0
def cand_lahiri(jd_tt): return LAHIRI_ANCHOR + prec_deg(jd_tt)


class Oracle:
    def __init__(self):
        self.k = verify_kernel()
        self.ts = load.timescale(builtin=True)
        self.eph = load_file(KERNEL)
        self.earth = self.eph["earth"]
        self.b = {k: self.eph[v] for k, v in BODY.items()}
        self.moon = self.b["MOON"]

    def _t(self, when): return self.ts.from_datetime(when)
    def trop(self, body, when):
        t = self._t(when)
        lat, lon, dist = self.earth.at(t).observe(self.b[body]).apparent().ecliptic_latlon(epoch="date")
        return norm360(lon.degrees), lat.degrees, dist.au
    def sid(self, body, when):
        t = self._t(when)
        lon, _, _ = self.trop(body, when)
        return norm360(lon - cand_lahiri(t.tt))
    def speed(self, body, when):
        lp, _, _ = self.trop(body, when + dt.timedelta(seconds=600))
        lm, _, _ = self.trop(body, when - dt.timedelta(seconds=600))
        d = ((lp - lm + 540) % 360) - 180
        return d / (1200.0 / 86400.0)
    def node(self, when):
        t = self._t(when)
        geo = (self.moon - self.earth).at(t)
        r, v = geo.position.au, geo.velocity.au_per_d
        e = math.radians(obl_deg(t.tt)); ce, se = math.cos(e), math.sin(e)
        def toe(x): return np.array([x[0], x[1] * ce + x[2] * se, -x[1] * se + x[2] * ce])
        h = np.cross(toe(r), toe(v))
        return norm360(math.degrees(math.atan2(h[0], -h[1])) + prec_deg(t.tt))


def bisect_cross(f, a, b, target, span, iters=70):
    def g(w):
        lon = f(w)
        return ((lon - target) % span + 1.5 * span) % span - span / 2
    ga = g(a)
    for _ in range(iters):
        m = a + (b - a) / 2
        gm = g(m)
        if (ga <= 0 <= gm) or (ga >= 0 >= gm):
            b = m
        else:
            a, ga = m, gm
    return a + (b - a) / 2


STATION_WIN = {"MERCURY": 8, "VENUS": 20, "MARS": 28, "JUPITER": 55, "SATURN": 60}


def _offset(lon, target, span):
    return ((lon - target) % span + 1.5 * span) % span - span / 2


def nearest_crossing(f, when, target, span, step_days, max_win_days):
    """Nearest-crossing outward scan + bisection (mirrors the adapter). Returns UTC or None."""
    def g(w):
        return _offset(f(w), target % 360, span)

    def try_pair(a, b):
        ga, gb = g(a), g(b)
        if ((ga <= 0 <= gb) or (ga >= 0 >= gb)) and abs(ga - gb) < span * 0.9:
            for _ in range(70):
                m = a + (b - a) / 2
                gm = g(m)
                if (ga <= 0 <= gm) or (ga >= 0 >= gm):
                    b = m
                else:
                    a, ga = m, gm
            return a + (b - a) / 2
        return None

    step = dt.timedelta(days=step_days)
    k = 0
    while k * step_days <= max_win_days:
        r = try_pair(when + k * step, when + (k + 1) * step)
        if r is not None:
            return r
        r = try_pair(when - (k + 1) * step, when - k * step)
        if r is not None:
            return r
        k += 1
    return None


def certify_crossing(oc, body, btype, when):
    """Nearest-crossing certification (mirrors the adapter exactly)."""
    span = SPANS[btype]
    s0 = oc.sid(body, when)
    sp = abs(oc.speed(body, when)) or 0.01
    cross_period = span / sp  # days between adjacent crossings
    target = 0.0 if btype == "WRAP_ARIES" else round(s0 / span) * span
    solved = nearest_crossing(lambda ww: oc.sid(body, ww), when, target % 360, span, 0.2 * cross_period, 2 * cross_period)
    return {"body": body, "type": btype, "target": float(target % 360),
            "solvedUtc": (solved.astimezone(dt.timezone.utc).isoformat() if solved else None)}


def bisect_station(oc, body, a, b, iters=60):
    def s(w): return oc.speed(body, w)
    sa = s(a)
    for _ in range(iters):
        m = a + (b - a) / 2
        sm = s(m)
        if (sa <= 0 <= sm) or (sa >= 0 >= sm):
            b = m
        else:
            a, sa = m, sm
    return a + (b - a) / 2


def main():
    oc = Oracle()
    corpus = json.load(open(os.path.join(FIX, "golden-corpus.json"), encoding="utf-8"))
    results = {}
    transitions = {}
    for fx in corpus["fixtures"]:
        if fx["expectedClass"] == "CLASS_D":
            results[fx["id"]] = {"unavailable": True}
            continue
        when = dt.datetime.fromisoformat(fx["utcInstant"].replace("Z", "+00:00"))
        t = oc._t(when)
        bodies = {}
        for b in CLASSICAL:
            lon, lat, dist = oc.trop(b, when)
            sp = oc.speed(b, when)
            bodies[b] = {"tropicalLon": float(lon), "eclLat": float(lat), "distanceAu": float(dist),
                         "lonSpeed": float(sp), "retrograde": bool(sp < 0)}
        node = oc.node(when)
        bodies["RAHU"] = {"tropicalLon": float(node)}
        bodies["KETU"] = {"tropicalLon": float(norm360(node + 180))}
        results[fx["id"]] = {"utcInstant": fx["utcInstant"], "julianDayTt": float(t.tt), "bodies": bodies}

        bm = fx.get("boundaryMeta")
        if bm and bm.get("type") in SPANS and bm.get("body") in BODY:
            transitions[fx["id"]] = certify_crossing(oc, bm["body"], bm["type"], when)
        elif bm and bm.get("type") == "STATION" and bm.get("body") in BODY:
            solved = bisect_station(oc, bm["body"], when - dt.timedelta(days=STATION_WIN.get(bm["body"], 30)), when + dt.timedelta(days=STATION_WIN.get(bm["body"], 30)))
            transitions[fx["id"]] = {"body": bm["body"], "type": "STATION", "solvedUtc": solved.astimezone(dt.timezone.utc).isoformat()}

    # R1 nine-boundary closure transitions (Workstream G)
    r1path = os.path.join(FIX, "r1-closure-cases.json")
    if os.path.exists(r1path):
        for fx in json.load(open(r1path, encoding="utf-8"))["fixtures"]:
            when = dt.datetime.fromisoformat(fx["utcInstant"].replace("Z", "+00:00"))
            bm = fx["boundaryMeta"]
            if bm["type"] == "STATION" and bm["body"] in BODY:
                solved = bisect_station(oc, bm["body"], when - dt.timedelta(days=STATION_WIN.get(bm["body"], 30)), when + dt.timedelta(days=STATION_WIN.get(bm["body"], 30)))
                transitions[fx["id"]] = {"r1Fixture": fx["r1Fixture"], "body": bm["body"], "type": "STATION", "solvedUtc": solved.astimezone(dt.timezone.utc).isoformat()}
            elif bm["body"] in BODY and bm["type"] in SPANS:
                t = certify_crossing(oc, bm["body"], bm["type"], when)
                t["r1Fixture"] = fx["r1Fixture"]
                transitions[fx["id"]] = t

    g1 = json.load(open(os.path.join(FIX, "g1-node-timestamps.json"), encoding="utf-8"))
    g1pts = []
    for iso in g1["instants"]:
        when = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        g1pts.append({"iso": iso, "rahuTropicalLon": float(oc.node(when))})

    meta = {"provider": "skyfield-de440s", "skyfield": __import__("skyfield").__version__,
            "numpy": np.__version__, "kernel": "de440s.bsp", "kernelSha256": oc.k["sha256"],
            "frame": "geocentric apparent ecliptic-of-date; node=osculating(state vector)+precession-to-date"}
    json.dump({"meta": meta, "results": results}, open(os.path.join(REPORTS, "oracle-r2-fixtures.json"), "w"), indent=2, sort_keys=True)
    json.dump({"meta": meta, "transitions": transitions}, open(os.path.join(REPORTS, "oracle-r2-transitions.json"), "w"), indent=2, sort_keys=True)
    json.dump({"meta": meta, "points": g1pts}, open(os.path.join(REPORTS, "oracle-r2-g1.json"), "w"), indent=2, sort_keys=True)
    print(f"oracle-r2: fixtures={len(results)} transitions={len(transitions)} g1={len(g1pts)}")


if __name__ == "__main__":
    main()
