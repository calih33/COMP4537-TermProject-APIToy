"""Pan-only gel blaster turret parts (28BYJ-48 stepper). Run: python3 turret_parts.py
Makes base.stl, turntable.stl, hub.stl. All sizes in mm. Edit the numbers below and re-run."""
import numpy as np, trimesh
from trimesh.boolean import union, difference

# ---------- things you may need to change ----------
BEARING_H      = 8.0    # height of your lazy susan bearing
BEARING_BOLT_SQ = 50.0  # square bolt pattern of the bearing (center to center), measure yours
BEARING_HOLE_D = 4.0    # hole size for the bearing bolts
PLATE_L, PLATE_W = 230.0, 170.0   # turntable (blaster is ~220 x 160)
BASE_SIZE      = 150.0  # square base
BASE_T         = 5.0
FOOT_H         = 28.0   # lets the motor hang under the base
TT_T           = 6.0    # turntable thickness
TOL            = 0.15   # printer tolerance
# 28BYJ-48 facts
EAR_SPACING    = 35.0   # mounting hole spacing
SHAFT_OFFSET   = 8.0    # shaft is 8mm off the motor body center
SHAFT_D, SHAFT_FLAT = 5.0, 3.0
# hub
FLANGE_D, FLANGE_T = 34.0, 4.0
STEM_D         = 14.0
HUB_BOLT_R     = 12.0
BORE_DEPTH     = 7.0
# ----------------------------------------------------
S = 48
def cyl(d, h, x=0, y=0, z0=0):
    c = trimesh.creation.cylinder(radius=d/2, height=h, sections=S)
    c.apply_translation([x, y, z0 + h/2]); return c
def box(l, w, h, x=0, y=0, z0=0):
    b = trimesh.creation.box(extents=[l, w, h]); b.apply_translation([x, y, z0 + h/2]); return b
def rrect(l, w, h, r, z0=0):
    parts = [box(l-2*r, w, h, z0=z0), box(l, w-2*r, h, z0=z0)]
    for sx in (-1, 1):
        for sy in (-1, 1):
            parts.append(cyl(2*r, h, sx*(l/2-r), sy*(w/2-r), z0))
    return union(parts, engine="manifold")
def sub(a, cuts): return difference([a] + cuts, engine="manifold")

half = BEARING_BOLT_SQ / 2
bolt_pts = [(sx*half, sy*half) for sx in (-1, 1) for sy in (-1, 1)]

# ---------- BASE (shaft at origin, motor hangs underneath) ----------
base = rrect(BASE_SIZE, BASE_SIZE, BASE_T, 8)
f = BASE_SIZE/2 - 10
for sx in (-1, 1):
    for sy in (-1, 1):
        base = union([base, cyl(18, FOOT_H, sx*f, sy*f, -FOOT_H)], engine="manifold")
cuts = [cyl(10.5, BASE_T+2, 0, 0, -1)]                      # shaft + boss hole
for sx in (-1, 1):                                          # motor ear screws (M3), counterbored
    ex, ey = sx*EAR_SPACING/2, -SHAFT_OFFSET
    cuts += [cyl(3.5, BASE_T+2, ex, ey, -1), cyl(6.6, 3, ex, ey, BASE_T-3)]
for x, y in bolt_pts: cuts.append(cyl(BEARING_HOLE_D, BASE_T+2, x, y, -1))
for sx in (-1, 1):
    for sy in (-1, 1): cuts.append(cyl(4.5, FOOT_H+BASE_T+2, sx*f, sy*f, -FOOT_H-1))  # screw down holes
base = sub(base, cuts); base.export("base.stl")

# ---------- TURNTABLE ----------
tt = rrect(PLATE_L, PLATE_W, TT_T, 10)
cuts = [cyl(STEM_D+0.6, TT_T+2, 0, 0, -1),
        cyl(FLANGE_D+0.4, FLANGE_T+0.2, 0, 0, TT_T-FLANGE_T-0.2+0.0001)]   # hub pocket
for a in (45, 135, 225, 315):
    x, y = HUB_BOLT_R*np.cos(np.radians(a)), HUB_BOLT_R*np.sin(np.radians(a))
    nut = trimesh.creation.cylinder(radius=3.4, height=2.6, sections=6); nut.apply_translation([x, y, 1.3-0.01])
    cuts += [cyl(3.4, TT_T+2, x, y, -1), nut]
for x, y in bolt_pts:                                       # bearing bolts, heads recessed
    cuts += [cyl(BEARING_HOLE_D, TT_T+2, x, y, -1), cyl(8, 3, x, y, TT_T-3)]
for x in range(-105, 106, 30):                              # zip tie slots
    for y in (-70, -50, -25, 25, 50, 70):
        if np.hypot(x, y) > 45: cuts.append(box(5, 2.4, TT_T+2, x, y, -1))
tt = sub(tt, cuts); tt.export("turntable.stl")

# ---------- HUB (flange sits in the turntable pocket, stem drops onto the motor shaft) ----------
stem_len = BEARING_H + (TT_T - FLANGE_T) - 1.0
hub = union([cyl(FLANGE_D, FLANGE_T, 0, 0, stem_len), cyl(STEM_D, stem_len+0.01, 0, 0, 0)], engine="manifold")
dbore = trimesh.boolean.intersection([cyl(SHAFT_D+TOL, BORE_DEPTH+1, 0, 0, -1),
                                      box(SHAFT_D+2, SHAFT_FLAT+TOL, BORE_DEPTH+1, 0, 0, -1)], engine="manifold")
cuts = [dbore]
for a in (45, 135, 225, 315):
    x, y = HUB_BOLT_R*np.cos(np.radians(a)), HUB_BOLT_R*np.sin(np.radians(a))
    cuts += [cyl(3.4, FLANGE_T+2, x, y, stem_len-1), cyl(6.6, 2.2, x, y, stem_len+FLANGE_T-2.2)]
hub = sub(hub, cuts); hub.export("hub.stl")

for n, m in (("base", base), ("turntable", tt), ("hub", hub)):
    print(n, "watertight:", m.is_watertight, "size:", np.round(m.extents, 1))
print("hub stem length:", stem_len)
