# JLM Night Rush 🏁

**Jerusalem Rush** – browser racing game on real Jerusalem streets.

## What's included

### 1. Real Map Prototype (`jerusalem_rush_real_map.html`)
- OpenStreetMap vector tiles via MapLibre GL
- Real terrain (AWS Terrarium DEM)
- 3D extruded buildings from OSM
- Quick jump to: Begin Blvd, Jaffa St, Old City, Knesset, Mount Scopus, Malha, Har Hotzvim, Hebron Rd, Highway 1, etc.
- Stylized car marker (placeholder for future driving)

### 2. Three.js driving prototype (`jerusalem-rush.html`)
- Free-roam car with keyboard + touch controls
- Road network inspired by real Jerusalem layout (polylines)
- Garage (color change), quick race mode, minimap
- Hebrew UI

## How to run
Just open any of the `.html` files in a modern browser (Chrome / Edge / Firefox).  
No installation or build step required.

## Roadmap
- [ ] Controllable car on the real MapLibre map
- [ ] Snap-to-road or free physics on OSM road network
- [ ] Night mode lighting
- [ ] Career / garage progression
- [ ] Sound & polish

## Credits
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Terrain: AWS Terrain Tiles
- Map style: OpenFreeMap / MapLibre

---
Built as an experiment – free to fork and improve.
