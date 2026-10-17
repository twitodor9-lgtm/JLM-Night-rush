import type { RoadWay, GameMap, XZ } from './types';
export interface GraphEdge { to: number; roadId: number | string; length: number; oneway: boolean }
export interface NearestRoad { road: RoadWay; distance: number; point: XZ; segment: number }
type Segment = {road:RoadWay; a:XZ;b:XZ; cuts:number[]};
/** A road graph in local meters. Real crossings are split into graph nodes.
 * IMPORTANT: grade-separated roads should be filtered by layer/bridge/tunnel metadata
 * before running planar intersection detection on production OSM data.
 */
export class RoadNetwork {
  roads: RoadWay[]; nodes:XZ[]=[]; adjacency:GraphEdge[][]=[];
  bounds={minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity};
  roadBounds:{minX:number;maxX:number;minZ:number;maxZ:number}[]=[];
  private nodeIndex=new Map<string,number>();
  constructor(map:Pick<GameMap,'roads'>){
    this.roads=map.roads;
    const segments:Segment[]=[];
    for(const r of this.roads){
      const rb={minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity};
      for(const [x,z] of r.points){
        rb.minX=Math.min(rb.minX,x);rb.maxX=Math.max(rb.maxX,x);
        rb.minZ=Math.min(rb.minZ,z);rb.maxZ=Math.max(rb.maxZ,z);
      }
      for(let i=1;i<r.points.length;i++){
        const a=r.points[i-1],b=r.points[i];
        if(Math.hypot(a[0]-b[0],a[1]-b[1])>.001)segments.push({road:r,a,b,cuts:[0,1]});
      }
      this.roadBounds.push(rb);
      this.bounds.minX=Math.min(this.bounds.minX,rb.minX-r.width);
      this.bounds.maxX=Math.max(this.bounds.maxX,rb.maxX+r.width);
      this.bounds.minZ=Math.min(this.bounds.minZ,rb.minZ-r.width);
      this.bounds.maxZ=Math.max(this.bounds.maxZ,rb.maxZ+r.width);
    }
    // Planar intersection splitting. A future production pipeline should spatial-index
    // segments and exclude different OSM layers, bridges and tunnels.
    for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
      const s=segments[i],t=segments[j];
      // Adjacent pieces of the same way already share end points.
      const rx=s.b[0]-s.a[0],rz=s.b[1]-s.a[1],sx=t.b[0]-t.a[0],sz=t.b[1]-t.a[1];
      const den=rx*sz-rz*sx;
      if(Math.abs(den)<1e-9)continue;
      const qx=t.a[0]-s.a[0],qz=t.a[1]-s.a[1];
      const u=(qx*sz-qz*sx)/den,v=(qx*rz-qz*rx)/den;
      if(u>=-1e-7&&u<=1+1e-7&&v>=-1e-7&&v<=1+1e-7){
        s.cuts.push(Math.max(0,Math.min(1,u)));
        t.cuts.push(Math.max(0,Math.min(1,v)));
      }
    }
    for(const s of segments){
      const params=[...new Set(s.cuts.map(v=>Math.round(v*1e7)/1e7))].sort((a,b)=>a-b);
      for(let i=1;i<params.length;i++){
        const t0=params[i-1],t1=params[i];
        const a=this.node(s.a[0]+(s.b[0]-s.a[0])*t0,s.a[1]+(s.b[1]-s.a[1])*t0);
        const b=this.node(s.a[0]+(s.b[0]-s.a[0])*t1,s.a[1]+(s.b[1]-s.a[1])*t1);
        if(a===b)continue;
        const length=Math.hypot(this.nodes[b][0]-this.nodes[a][0],this.nodes[b][1]-this.nodes[a][1]);
        this.adjacency[a].push({to:b,roadId:s.road.id,length,oneway:s.road.oneway});
        if(!s.road.oneway)this.adjacency[b].push({to:a,roadId:s.road.id,length,oneway:false});
      }
    }
  }
  private node(x:number,z:number):number{
    const key=`${Math.round(x*100)/100},${Math.round(z*100)/100}`;
    let id=this.nodeIndex.get(key);
    if(id===undefined){id=this.nodes.length;this.nodeIndex.set(key,id);this.nodes.push([x,z]);this.adjacency.push([]);}
    return id;
  }
  nearestRoad(x:number,z:number):NearestRoad|null{
    let best:NearestRoad|null=null;
    this.roads.forEach((r,ri)=>{
      const rb=this.roadBounds[ri];
      if(best&&(x<rb.minX-best.distance||x>rb.maxX+best.distance||z<rb.minZ-best.distance||z>rb.maxZ+best.distance))return;
      for(let i=0;i<r.points.length-1;i++){
        const [ax,az]=r.points[i],[bx,bz]=r.points[i+1];
        const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
        const t=l2===0?0:Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2));
        const px=ax+t*dx,pz=az+t*dz,d=Math.hypot(x-px,z-pz);
        if(!best||d<best.distance)best={road:r,distance:d,point:[px,pz],segment:i};
      }
    });
    return best;
  }
  componentCount():number{
    const seen=new Array(this.nodes.length).fill(false);let count=0;
    // Weak components: traverse both directions of a one-way street.
    const undirected=this.adjacency.map(a=>a.map(e=>e.to));
    this.adjacency.forEach((edges,i)=>edges.forEach(e=>undirected[e.to].push(i)));
    for(let i=0;i<this.nodes.length;i++){
      if(seen[i])continue;count++;const st=[i];seen[i]=true;
      while(st.length){const n=st.pop()!;for(const v of undirected[n])if(!seen[v]){seen[v]=true;st.push(v);}}
    }
    return count;
  }
}
