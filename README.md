# JLM Night Rush 🏁

**Jerusalem Rush** – browser racing game on real Jerusalem streets.

## Live files in this repo

### 1. Real Map Prototype – **recommended**
**[`jerusalem_rush_real_map.html`](jerusalem_rush_real_map.html)**

- OpenStreetMap vector tiles via MapLibre GL  
- Real terrain (AWS Terrarium DEM)  
- 3D extruded buildings from OSM  
- Quick jump buttons: Begin Blvd, Jaffa St, Old City, Knesset, Mount Scopus, Malha, Har Hotzvim, Hebron Rd, Highway 1…  
- Stylized car marker (ready for driving logic)

Open the file in any modern browser – no install needed.

### 2. Three.js free-roam prototype
**[`jerusalem-rush.html`](jerusalem-rush.html)**  
Currently a lightweight entry that points to the real map.  
The full playable Three.js version (garage, race, minimap, polylines based on real road layout) is available in the project conversation artifacts and can be re-uploaded on request.

## How to run
1. Download `jerusalem_rush_real_map.html`
2. Open it in Chrome / Edge / Firefox
3. Use the side panel to jump to real Jerusalem locations

## Roadmap
- [x] Real OSM map of Jerusalem with terrain + 3D buildings
- [ ] Controllable car on the MapLibre map
- [ ] Snap-to-road / free physics on OSM road network
- [ ] Night mode lighting (“Night Rush”)
- [ ] Career / garage progression
- [ ] Sound & polish

## Credits
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors  
- Terrain: AWS Terrain Tiles  
- Map style: OpenFreeMap / MapLibre  

---
Built as an experiment – free to fork and improve.
