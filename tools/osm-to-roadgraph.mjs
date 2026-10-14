#!/usr/bin/env node
/**
 * Offline OpenStreetMap road extraction.
 * Input: saved Overpass JSON with ways + "out geom;".
 * Output: local-meter road graph, precomputed once at build time.
 * Never fetches data while the player is driving.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const [inputPath, outputPath = 'public/maps/first-station-roads.json'] = process.argv.slice(2);
if (!inputPath) {
  console.error('Usage: node tools/osm-to-roadgraph.mjs <overpass.json> [output.json]');
  process.exit(1);
}
const raw = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
const lon0 = 35.2240, lat0 = 31.7652; // approximate First Station origin; not sampled road coordinates
const metersPerDegLat = 111132.92;
const metersPerDegLon = 111412.84 * Math.cos(lat0 * Math.PI / 180);
const projection = ([lon,lat]) => [
  Math.round((lon-lon0)*metersPerDegLon*100)/100,
  Math.round((lat-lat0)*metersPerDegLat*100)/100
];
const vehicles = new Set(['motorway','trunk','primary','secondary','tertiary','unclassified','residential','service','living_street',
'motorway_link','trunk_link','primary_link','secondary_link','tertiary_link']);
const roads = [];
for(const e of raw.elements ?? []) {
  if(e.type !== 'way' || !vehicles.has(e.tags?.highway) || !Array.isArray(e.geometry) || e.geometry.length < 2) continue;
  if(e.tags?.access === 'no' || e.tags?.motor_vehicle === 'no' || e.tags?.motorcar === 'no') continue;
  const points=e.geometry.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)).map(p=>projection([p.lon,p.lat]));
  if(points.length<2) continue;
  const lanes=Number(e.tags?.lanes), width=Number.parseFloat(e.tags?.width);
  const defaultWidth=e.tags?.highway==='residential'?6:e.tags?.highway==='service'?4:8;
  roads.push({id:e.id,type:e.tags.highway,name:e.tags.name??'',points,width:Number.isFinite(width)&&width>1?width:Number.isFinite(lanes)&&lanes>0?lanes*3.2:defaultWidth,bridge:e.tags.bridge==='yes',tunnel:e.tags.tunnel==='yes',layer:Number(e.tags.layer??0),oneway:e.tags.oneway==='yes',source:'OpenStreetMap'});
}
const output={schema:1,source:'OpenStreetMap contributors',license:'ODbL 1.0',origin:{lon:lon0,lat:lat0},roads};
await mkdir(dirname(resolve(outputPath)),{recursive:true});
await writeFile(resolve(outputPath),JSON.stringify(output)+'\n');
console.log('Wrote',roads.length,'roads to',outputPath);
