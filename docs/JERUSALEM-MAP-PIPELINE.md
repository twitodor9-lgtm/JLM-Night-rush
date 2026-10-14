# Jerusalem map-data workflow

## Scope
The engine test track remains synthetic. No file in this directory is claimed to be a real road map yet.

## Acquire data once (outside game runtime)
1. Visit https://overpass-turbo.eu/ .
2. Paste and run the query below.
3. Export **raw OSM data as JSON** (ways must include `geometry`; API query uses `out geom;`).
4. Save as `data/source/first-station-overpass.json`.

```overpass
[out:json][timeout:90];
(
  way["highway"](31.756,35.213,31.773,35.237);
);
out geom;
```

Bounds are an initial **approximate** crop covering the First Station vicinity. Review and adjust before finalizing a race route.

## Bake a local road graph

```sh
npm run map:build -- data/source/first-station-overpass.json public/maps/first-station-roads.json
npm run test:map
```

The script outputs a reproducible, static road graph in meters relative to a local origin. It filters pedestrian-only highways and common access restrictions. It is **not yet** road polygons, routable intersections, or a validated Jerusalem map.

## Quality gates before use in gameplay
- Confirm that the data actually depicts the intended roads.
- Resolve intersection connectivity, turn restrictions, service/parking roads and legally drivable access.
- Generate asphalt/curb meshes and collider geometry from the same road topology.
- Repair road elevation and ramp continuity with better DEM/hand-authored correction points.
- Reuse the baked graph for the circular minimap and traffic AI; prohibit Overpass calls at runtime.

Data attribution: © OpenStreetMap contributors, ODbL (https://www.openstreetmap.org/copyright).
