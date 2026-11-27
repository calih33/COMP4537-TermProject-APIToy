"""The HTML debug UI served at /debug."""
from flask import Response


class DebugPage:
    HTML = r"""<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<title>Turret debug</title>
<style>
:root{color-scheme:light dark} body{font:15px system-ui;max-width:640px;margin:16px auto;padding:0 12px}
button{padding:8px 12px;margin:2px;font:inherit} fieldset{margin:10px 0;border-radius:8px}
#estop{background:#c62828;color:#fff;border:0;width:100%;padding:14px;font-size:18px;border-radius:8px}
pre{background:#8882;padding:8px;border-radius:6px;max-height:200px;overflow:auto;font-size:12px}
input[type=range]{width:100%}
</style>
<h2>Turret debug</h2>
<button id=estop onclick="call('/estop',{})">EMERGENCY STOP</button>
<fieldset><legend>Status</legend><pre id=st></pre></fieldset>
<fieldset><legend>Pan</legend>
<input type=range id=pan min=-90 max=90 value=0 oninput="pv.textContent=this.value">
<div>Angle: <b id=pv>0</b> <button onclick="call('/pan/to',{deg:+pan.value})">Go</button>
<button onclick="call('/pan/center',{})">Center</button></div>
<div><button onclick="nudge(-10)">-10</button><button onclick="nudge(-1)">-1</button>
<button onclick="nudge(1)">+1</button><button onclick="nudge(10)">+10</button>
<button onclick="call('/pan/stop',{})">Stop</button><button onclick="call('/pan/zero',{})">Set zero here</button>
<button onclick="call('/pan/release',{})">Release motor</button></div></fieldset>
<fieldset><legend>Trigger</legend>
<button onclick="call('/arm',{})">Arm</button><button onclick="call('/disarm',{})">Disarm</button>
Hold <input id=ms type=number value=400 style="width:5em"> ms <button onclick="call('/fire',{ms:+ms.value})">Fire</button>
<input type=range id=sv min=0 max=180 value=20 oninput="svv.textContent=this.value">
<div>Servo angle (needs armed): <b id=svv>20</b> <button onclick="call('/servo/angle',{angle:+sv.value})">Set</button>
<button onclick="call('/servo/rest',{})">Rest</button></div></fieldset>
<fieldset><legend>Log</legend><pre id=log></pre></fieldset>
<script>
async function call(path, body, quiet){
  const r = await fetch(path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const j = await r.json().catch(()=>({}));
  if(!r.ok && !quiet) alert(j.error||r.statusText);
  return j;
}
function nudge(d){ call('/pan/by',{deg:d}); }
async function poll(){
  const s = await call('/status',undefined,true); st.textContent = JSON.stringify(s,null,1);
  const l = await call('/log',undefined,true); log.textContent = (l.log||[]).slice().reverse().join('\n');
}
setInterval(poll,500); poll();
</script>"""

    def response(self) -> Response:
        return Response(self.HTML, mimetype="text/html")
