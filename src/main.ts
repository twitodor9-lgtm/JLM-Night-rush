import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import './style.css';

// ENGINE FOUNDATION TEST: fictional proving ground only, never present as real Jerusalem.
const app = document.getElementById('app')!;
app.innerHTML = `<canvas id="game"></canvas><div class="ui">JLM <span>NIGHT RUSH</span><small>0.8 · PHYSICS PROVING GROUND · NOT JERUSALEM</small><div class="speed"><span id="speed">0</span> km/h</div></div><canvas id="map" width="180" height="180"></canvas><div class="help">W/S נסיעה · A/D היגוי · SPACE דריפט · R איפוס</div><div class="touch"><div><button data-key="KeyA">◀</button><button data-key="KeyD">▶</button></div><div><button data-key="Space">DRIFT</button><button data-key="KeyS">BRAKE</button><button data-key="KeyW">GAS</button></div></div>`;
const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#game')!,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new THREE.Scene();scene.background=new THREE.Color('#213c56');scene.fog=new THREE.Fog('#213c56',100,260);
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,450);
scene.add(new THREE.HemisphereLight(0xe8f2ff,0x4d554b,2));
const light=new THREE.DirectionalLight(0xffe3ad,2.8);light.position.set(-30,65,-25);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-100;light.shadow.camera.right=100;light.shadow.camera.top=100;light.shadow.camera.bottom=-100;scene.add(light);
const material=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.78});
const asphalt=material(0x333b44),curb=material(0xa9a297),terrain=material(0x62725b),line=material(0xe7d8a2);
function cube(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m;}
cube(0,-.25,0,250,.3,250,terrain);
cube(0,-.08,0,18,.15,220,asphalt);
for(let z=-106;z<110;z+=12)cube(0,.005,z,.2,.012,5,line);
for(const x of [-10,10])cube(x,-.02,0,.8,.2,220,curb);
const ramp=cube(5.5,1.55,-50,5.4,.3,18,asphalt);ramp.rotation.x=-.16;
for(let i=0;i<22;i++){const x=i%2?20:-20,z=-100+i*9,h=3+i%4;cube(x,h/2,z,5,h,6,material(i%2?0xb3ad9e:0x99968d));}
await RAPIER.init();
const world=new RAPIER.World({x:0,y:-9.81,z:0});
function staticBox(x:number,y:number,z:number,w:number,h:number,d:number,rotation?:THREE.Quaternion){const b=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));if(rotation)b.setRotation(rotation,true);world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setFriction(1.2),b);}
staticBox(0,-.25,0,250,.3,250);staticBox(0,-.08,0,18,.15,220);staticBox(5.5,1.55,-50,5.4,.3,18,ramp.quaternion);
const car=new THREE.Group();scene.add(car);
const carBody=new THREE.Mesh(new THREE.BoxGeometry(1.9,.65,4.1),material(0xf0a12e));carBody.castShadow=true;carBody.position.y=.1;car.add(carBody);
const glass=new THREE.Mesh(new THREE.BoxGeometry(1.65,.55,2),material(0x152b3d));glass.position.set(0,.68,-.25);glass.castShadow=true;car.add(glass);
for(const x of [-.96,.96])for(const z of [-1.4,1.4]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.28,14),material(0x141a1c));wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.15,z);wheel.castShadow=true;car.add(wheel);}
const rb=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,1.3,80).setLinearDamping(.3).setAngularDamping(2).setCcdEnabled(true));
world.createCollider(RAPIER.ColliderDesc.cuboid(.94,.32,1.88).setMass(850).setFriction(.8),rb);
const keys=new Set<string>(), mapping:Record<string,string>={ArrowUp:'KeyW',ArrowDown:'KeyS',ArrowLeft:'KeyA',ArrowRight:'KeyD'};
function reset(){rb.setTranslation({x:0,y:1.4,z:80},true);rb.setRotation({x:0,y:0,z:0,w:1},true);rb.setLinvel({x:0,y:0,z:0},true);rb.setAngvel({x:0,y:0,z:0},true);}
addEventListener('keydown',e=>{const code=mapping[e.code]??e.code;if(['KeyW','KeyA','KeyS','KeyD','KeyR','Space'].includes(code))e.preventDefault();keys.add(code);if(code==='KeyR')reset()});
addEventListener('keyup',e=>keys.delete(mapping[e.code]??e.code));addEventListener('blur',()=>keys.clear());
for(const b of document.querySelectorAll<HTMLButtonElement>('.touch button')){const key=b.dataset.key!;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(key));}
const forward=new THREE.Vector3(),side=new THREE.Vector3(),velocity=new THREE.Vector3(),orientation=new THREE.Quaternion();
let steer=0;
function physicsStep(){const p=rb.translation(),r=rb.rotation();orientation.set(r.x,r.y,r.z,r.w);forward.set(0,0,1).applyQuaternion(orientation);side.set(1,0,0).applyQuaternion(orientation);const v=rb.linvel();velocity.set(v.x,v.y,v.z);
 const throttle=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));const steerTarget=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));steer=THREE.MathUtils.damp(steer,steerTarget,8,1/60);
 // Raycast ground probe. Dynamic vehicle suspension/axle forces are next extraction from Costa Vista.
 const ray=new RAPIER.Ray({x:p.x,y:p.y,z:p.z},{x:0,y:-1,z:0});
 const hit=world.castRay(ray,2,true,undefined,undefined,undefined,rb);
 const grounded=!!hit;
 if(grounded){
  const speed=velocity.dot(forward);
  const impulse=forward.clone().multiplyScalar(throttle*90);
  rb.applyImpulse({x:impulse.x,y:0,z:impulse.z},true);
  const lateral=velocity.dot(side), grip=keys.has('Space')?.09:.35;
  const cancel=side.clone().multiplyScalar(-lateral*grip*850);
  rb.applyImpulse({x:cancel.x,y:0,z:cancel.z},true);
  const turn=steer*Math.min(1.2,Math.abs(speed)*.06)*Math.sign(speed||1);
  rb.applyTorqueImpulse({x:0,y:turn*90,z:0},true);
  const resist=forward.clone().multiplyScalar(-Math.sign(speed)*speed*speed*.03);
  rb.applyImpulse({x:resist.x,y:0,z:resist.z},true);
 }
 world.step();
 if(p.y<-10)reset();
}
const map=document.querySelector<HTMLCanvasElement>('#map')!,ctx=map.getContext('2d')!;
function drawMap(){const p=rb.translation();ctx.clearRect(0,0,180,180);ctx.save();ctx.beginPath();ctx.arc(90,90,87,0,Math.PI*2);ctx.clip();ctx.fillStyle='#102435';ctx.fillRect(0,0,180,180);ctx.translate(90,90);ctx.rotate(car.rotation.y);ctx.translate(-p.x*.64,-p.z*.64);ctx.fillStyle='#566b77';ctx.fillRect(-9*.64,-110*.64,18*.64,220*.64);ctx.fillStyle='#f1deb1';for(let z=-106;z<110;z+=12)ctx.fillRect(-.7,z*.64,1.4,5);ctx.restore();ctx.fillStyle='#ffc366';ctx.beginPath();ctx.moveTo(90,76);ctx.lineTo(81,101);ctx.lineTo(99,101);ctx.fill();ctx.strokeStyle='#ffffff99';ctx.lineWidth=3;ctx.beginPath();ctx.arc(90,90,87,0,Math.PI*2);ctx.stroke();}
const target=new THREE.Vector3();let previous=performance.now(),accumulator=0;const fixedStep=1/60;
function frame(now:number){requestAnimationFrame(frame);const dt=Math.min(.05,(now-previous)/1000);previous=now;accumulator+=dt;let iterations=0;while(accumulator>=fixedStep&&iterations++<4){physicsStep();accumulator-=fixedStep;}
 const p=rb.translation(),r=rb.rotation();car.position.set(p.x,p.y,p.z);car.quaternion.set(r.x,r.y,r.z,r.w);
 const behind=new THREE.Vector3(0,4,-10).applyQuaternion(car.quaternion).add(car.position);camera.position.lerp(behind,1-Math.exp(-5*dt));target.lerp(car.position.clone().add(new THREE.Vector3(0,.7,0)),1-Math.exp(-8*dt));camera.lookAt(target);
 const v=rb.linvel();document.getElementById('speed')!.textContent=String(Math.round(Math.hypot(v.x,v.z)*3.6));drawMap();renderer.render(scene,camera);}
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});requestAnimationFrame(frame);
