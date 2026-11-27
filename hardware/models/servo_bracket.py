"""Servo bracket for the trigger puller (SG90 / MG90 style micro servo). Run: python3 servo_bracket.py
Makes servo_bracket.stl. All sizes in mm. Edit the numbers and re-run if your servo differs."""
import numpy as np, trimesh
from trimesh.boolean import union, difference

# ---- servo (measure yours with calipers) ----
SERVO_L, SERVO_W = 22.8, 12.4     # body length (along the ears) and width
EAR_SPAN_HOLES   = 27.8           # distance between the two ear screw holes
EAR_UNDER_Z      = 16.0           # height of the ear underside above the servo bottom
TOL              = 0.3
# ---- bracket ----
PLATE_L, PLATE_W, PLATE_T = 76.0, 22.0, 3.0
BLOCK_L, BLOCK_W = 36.0, 20.0
TIE_X            = 30.0           # zip tie groove positions (+/-)
S = 48

def box(l, w, h, x=0, y=0, z0=0):
    b = trimesh.creation.box(extents=[l, w, h]); b.apply_translation([x, y, z0 + h/2]); return b
def cyl(d, h, x=0, y=0, z0=0):
    c = trimesh.creation.cylinder(radius=d/2, height=h, sections=S); c.apply_translation([x, y, z0 + h/2]); return c

block_h = EAR_UNDER_Z
bracket = union([box(PLATE_L, PLATE_W, PLATE_T), box(BLOCK_L, BLOCK_W, block_h, z0=PLATE_T)], engine="manifold")
cuts = [box(SERVO_L+TOL, SERVO_W+TOL, block_h+1, 0, 0, PLATE_T)]                       # servo pocket (floor stays)
for sx in (-1, 1):
    cuts.append(box(8, 8, 4, sx*(BLOCK_L/2-3.5), 0, PLATE_T))                         # wire notch at the floor
    cuts.append(cyl(1.8, 9, sx*EAR_SPAN_HOLES/2, 0, PLATE_T+block_h-9))               # M2 screw pilot holes
    cuts.append(box(4.2, PLATE_W+2, 1.0, sx*TIE_X, 0, PLATE_T-1.0))                    # zip tie grooves
bracket = difference([bracket] + cuts, engine="manifold")
bracket.export("servo_bracket.stl")
print("watertight:", bracket.is_watertight, "size:", np.round(bracket.extents, 1))
