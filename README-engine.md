# JLM Night Rush — Engine Foundation v0.8

This is an **isolated physics test track, not a Jerusalem street map**.

## Run

`npm install` then `npm run dev` (Node 22+), open the URL printed by Vite.

## Controls

W/Up: throttle, S/Down: reverse/brake, A/D: steer, Space: handbrake, R: reset. Touch controls on touchscreens.

## Architecture decision

Three.js + Rapier + TypeScript + Vite. WebGL default. The road test uses baked geometry and static colliders; no live Overpass calls. Next step is a saved OSM road network for First Station, Jerusalem, and porting vetted MIT-licensed Costa Vista vehicle control with attribution. Do not reuse Costa Vista game assets without verifying separate licenses.

## Acceptance gates

1. Build passes in GitHub Actions.
2. Manual browser drive test on incline, steering, braking and reset.
3. Then introduce OSM-derived road data and circular minimap from the same road graph.
4. Test FPS on desktop and mobile before merging into main.

Existing root HTML files are intentionally preserved on main pending verification.
