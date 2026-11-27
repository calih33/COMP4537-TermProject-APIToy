# Hardware turret service

The hardware service runs on the Raspberry Pi and controls the toy blaster's
pan axis and trigger servo. It is a small Flask service that wraps the
`Turret` device facade. The Node.js backend can proxy its controls through the
authenticated `/api/v1/devices/turret/...` routes; see
[`backend/README.md`](../backend/README.md) for those endpoints.

## Project layout

| Path | Purpose |
| --- | --- |
| `turret/app.py` | Creates the device, configuration, event log, and API server; starts and shuts down the service |
| `turret/device.py` | Turret facade for pan, arming, firing, servo, status, and shutdown operations |
| `turret/api.py` | Flask JSON API that maps HTTP requests to `Turret` methods |
| `turret/pan.py` | Stepper pan-axis position and movement |
| `turret/trigger.py` | Servo trigger control, firing cooldown, and trigger parking |
| `turret/safety.py` | Arm state, idle timeout, and fire abort handling |
| `turret/drivers.py` | Real Raspberry Pi drivers and simulated drivers |
| `requirements.txt` | Flask and Raspberry Pi hardware dependencies |

## Requirements

- Python 3 with `venv` and `pip`
- For real hardware: a Raspberry Pi, an Adafruit DC & Stepper Motor HAT with a
  28BYJ-48 stepper on stepper 1, and a servo connected to BCM GPIO 12
  (physical pin 32)
- The servo driver uses `gpiozero` with its `pigpio` pin factory; the
  `pigpiod` daemon must be running on the Pi

The service defaults to simulation being off. Use simulation mode for
development before connecting or operating the real hardware.

## Setup and run in simulation mode

From the repository's `hardware` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install flask
$env:TURRET_SIM = "1"
python -m turret
```

On macOS/Linux, activate the environment with
`source .venv/bin/activate` and set simulation mode with
`export TURRET_SIM=1`. Simulation uses software-only stepper and servo drivers;
it requires Flask but does not access GPIO or the motor HAT.

The service listens at `http://127.0.0.1:5000` by default. Check it with:

```bash
curl http://127.0.0.1:5000/status
```

Stop it with Ctrl+C. The shutdown handler stops pan movement, parks the servo,
and releases the stepper driver.

## Setup and run on Raspberry Pi

From the repository's `hardware` directory on the Pi:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Enable the Pi's I2C interface for the motor HAT and start the `pigpiod` daemon
for the servo before running the service. Then start it from the `hardware`
directory:

```bash
python -m turret
```

By default this runs the real hardware drivers and listens only on
`127.0.0.1:5000`. To connect the Node backend from another machine, configure
the service bind address and the backend's `TURRET_URL` for the private
network, and restrict inbound access to the backend host.

## Configuration

These are the environment variables read by `turret.config.Config.from_env`:

| Variable | Default | Description |
| --- | --- | --- |
| `TURRET_HOST` | `127.0.0.1` | Address on which Flask listens |
| `TURRET_PORT` | `5000` | Flask listening port |
| `TURRET_SIM` | `0` (real drivers) | Set to `1` to use simulated drivers |

Other device tuning values (pan limits, servo angles, fire duration, cooldown,
and arm timeout) are defined in `turret/config.py`.

## Hardware API

Successful action requests return the current turret status as JSON. Errors
return `{ "ok": false, "error": "message" }` with the corresponding HTTP status.
Requests that need values accept a JSON body.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/status` | Current pan, servo, arm, and firing state |
| GET | `/log` | Recent event log |
| GET | `/debug` | Browser-based local control and status page |
| POST | `/pan/to` | Move to absolute `{ "deg": number }`; position is limited to ±90° by default |
| POST | `/pan/by` | Move by relative `{ "deg": number }` |
| POST | `/pan/center` | Move to center |
| POST | `/pan/stop` | Stop pan movement |
| POST | `/pan/zero` | Set current position as zero |
| POST | `/pan/release` | Stop and release the pan motor |
| POST | `/arm` | Arm the trigger system |
| POST | `/disarm` | Disarm and abort firing |
| POST | `/estop` | Stop, disarm, and park the servo |
| POST | `/fire` | Fire using optional `{ "ms": number }`; defaults to 400 ms and is capped at 3000 ms |
| POST | `/servo/angle` | Set `{ "angle": number }` from 0–180; requires arming |
| POST | `/servo/rest` | Return the servo to its resting position |

Firing requires the device to be armed. The service automatically disarms after
120 seconds without activity, enforces a 0.5-second firing cooldown, and caps a
fire command at 3000 ms by default. See `turret/config.py` for the current
defaults.

## Safety and network access

This service directly controls physical hardware. Test with `TURRET_SIM=1`
first, keep the mechanism pointed in a controlled direction, and never aim or
fire at people or animals. The Flask service does not authenticate requests;
`/debug` also exposes device controls. Keep the default loopback bind when
possible. If remote access is required, use a private network and firewall
rules that allow only the backend host—do not expose this service directly to
the public internet.

