import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
test('saved OSM ways become meter-based local road graph without network',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'jlm-osm-'));
 try {
  const input=join(folder,'input.json'),output=join(folder,'output.json');
  const demo={elements:[
   {type:'way',id:101,tags:{highway:'residential',name:'Test only',lanes:'2'},geometry:[{lat:31.7652,lon:35.224},{lat:31.7662,lon:35.2241}]},
   {type:'way',id:102,tags:{highway:'footway'},geometry:[{lat:31.7652,lon:35.224},{lat:31.7662,lon:35.2241}]},
   {type:'way',id:103,tags:{highway:'service',motor_vehicle:'no'},geometry:[{lat:31.7652,lon:35.224},{lat:31.7662,lon:35.2241}]}
  ]};
  await writeFile(input,JSON.stringify(demo));
  execFileSync(process.execPath,['tools/osm-to-roadgraph.mjs',input,output]);
  const graph=JSON.parse(await readFile(output,'utf8'));
  assert.equal(graph.roads.length,1);
  assert.equal(graph.roads[0].id,101);
  assert.equal(graph.roads[0].width,6.4);
  assert.equal(graph.roads[0].points[0][0],0);
  assert.equal(graph.roads[0].points[0][1],0);
  assert.ok(graph.roads[0].points[1][1]>100);
 } finally {await rm(folder,{recursive:true,force:true});}
});
