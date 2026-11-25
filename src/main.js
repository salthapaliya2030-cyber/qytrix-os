import "./styles.css";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const root = document.querySelector("#root");
root.innerHTML = `
<main id="game">
  <canvas id="world"></canvas><div class="vignette"></div><div id="damage-flash"></div>
  <header class="hud-top"><div class="brand">PARIS RUNAWAY <span>1789 • MULTIVERSE INCIDENT</span></div><div class="distance"><small>DISTANCE</small><b id="distance">0 m</b></div></header>
  <div class="crosshair"><i></i><i></i></div>
  <section class="mission"><div class="mission-tag">ESCAPE THE CITY</div><div class="mission-title">DON'T LOOK BACK.</div><p id="mission-sub">Something is right behind you.</p></section>
  <section class="bottom-hud"><div class="stamina-wrap"><div class="stamina-label"><span>STAMINA</span><b id="stamina-text">100%</b></div><div class="stamina-track"><div id="stamina-fill"></div></div></div><div class="hint">WASD MOVE <b>•</b> SPACE JUMP <b>•</b> SHIFT SLIDE <b>•</b> CTRL SPRINT <b>•</b> Q LOOK BACK</div></section>
  <div id="toast" class="toast">CLICK TO START</div>
  <section id="menu" class="screen"><div class="menu-card"><div class="eyebrow">A BLOCKY 3D CHASE GAME</div><h1>PARIS<br><em>RUNAWAY.</em></h1><p>One city. A thousand weirdos. One very bad day.</p><button id="start">START RUN <span>→</span></button><div class="controls"><span>WASD / ARROWS <b>MOVE</b></span><span>SPACE <b>JUMP</b></span><span>SHIFT <b>SLIDE</b></span><span>CTRL <b>SPRINT</b></span><span>Q <b>LOOK BACK</b></span><span>ESC <b>PAUSE</b></span></div><small>CLICK START, THEN MOVE YOUR MOUSE TO LOOK AROUND</small></div></section>
  <section id="gameover" class="screen hidden"><div class="menu-card"><div class="eyebrow" id="end-eyebrow">THE CROWD CAUGHT UP</div><h1 id="end-title">RUN<br><em>ENDED.</em></h1><p id="final-score">You made it 0 meters.</p><button id="again">TRY AGAIN <span>↻</span></button></div></section>
  <div id="pause" class="pause hidden">PAUSED <small>press esc to continue</small></div>
  <div class="mobile-controls"><button data-move="left">←</button><button data-move="right">→</button><button data-move="jump">↑</button><button data-move="slide">↓</button></div>
</main>`;

const $ = id => document.getElementById(id);
const canvas = $("world");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91a4b1);
scene.fog = new THREE.Fog(0x91a4b1, 28, 145);
const camera = new THREE.PerspectiveCamera(78, innerWidth / innerHeight, .1, 260);
camera.position.set(0, 1.72, 0);
const renderer = new THREE.WebGLRenderer({canvas, antialias:false, powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
scene.add(new THREE.HemisphereLight(0xdcecff, 0x514039, 2.0));
const sun = new THREE.DirectionalLight(0xffd5a3, 2.0);
sun.position.set(-16, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(512,512);
sun.shadow.camera.left=-22; sun.shadow.camera.right=22; sun.shadow.camera.top=28; sun.shadow.camera.bottom=-28;
scene.add(sun);

const mat=(color,roughness=.9,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={
 road:mat(0x34383a), stone:mat(0x8a8276), dark:mat(0x292b2d), plaster:mat(0xc2ad8d),
 plaster2:mat(0x8d8a80), roof:mat(0x49494b), wood:mat(0x60432f), window:mat(0x263b46,.5),
 fire:new THREE.MeshStandardMaterial({color:0xff6b19,emissive:0xff3b00,emissiveIntensity:2}),
 gold:mat(0xd7a54b,.45), red:mat(0x9d2823), blue:mat(0x355a83), green:mat(0x496a49),
 skin:mat(0xd39a73), pants:mat(0x252b35), white:mat(0xe7e3d7), black:mat(0x17191b)
};
const boxGeo=new THREE.BoxGeometry(1,1,1);
function cube(parent,x,y,z,sx,sy,sz,material,shadow=false){
 const m=new THREE.Mesh(boxGeo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);
 m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;
}
cube(scene,0,-.38,-900,18,.76,2000,M.road,false);
for(const x of [-9.2,9.2]) cube(scene,x,4.5,-900,.5,9,2000,M.stone,false);
for(const x of [-5.5,5.5]) cube(scene,x,.015,-900,.12,.03,2000,mat(0xb9a88c),false);
for(let z=-2;z>-1900;z-=12){
 cube(scene,-1.5,.012,z,.08,.025,4,M.gold,false);
 cube(scene,1.5,.012,z,.08,.025,4,M.gold,false);
}

const cityChunks=[];
function makeCityChunk(z){
 const group=new THREE.Group();group.position.z=z;
 for(const side of [-1,1]){
  const width=3.2+Math.random()*1.3,height=7+Math.random()*6,depth=8+Math.random()*2;
  const building=new THREE.Group();building.position.x=side*(7.15+width/2);
  const wall=Math.random()>.5?M.plaster:M.plaster2;
  cube(building,0,height/2,0,width,height,depth,wall,true);
  cube(building,0,height+.18,0,width+.35,.35,depth+.35,M.roof,false);
  for(let yy=2;yy<height-1;yy+=2.7)for(let xx=-width/2+.65;xx<width/2-.25;xx+=1.3){
   cube(building,xx,yy,depth/2+.035,.62,1.12,.08,M.dark,false);
   cube(building,xx,yy,depth/2+.085,.45,.86,.04,M.window,false);
   cube(building,xx,yy+.58,depth/2+.13,.76,.1,.18,M.stone,false);
  }
  group.add(building);
  const lampX=side*5.8;
  cube(group,lampX,2.15,0,.13,4.3,.13,M.dark,false);
  cube(group,lampX-side*.42,4.25,0,.9,.12,.12,M.dark,false);
  const glow=new THREE.PointLight(0xffb45d,.55,7);glow.position.set(lampX-side*.5,4,0);group.add(glow);
  if(Math.random()>.45)cube(group,side*(3.7+Math.random()*.5),.55,-2,.85,1.1,.85,M.wood,true);
 }
 scene.add(group);cityChunks.push(group);
}
for(let i=0;i<18;i++)makeCityChunk(-i*11-7);

const arms=new THREE.Group();camera.add(arms);scene.add(camera);
const armLeft=new THREE.Group(),armRight=new THREE.Group();
armLeft.position.set(-.53,-.48,-.78);armRight.position.set(.53,-.48,-.78);
cube(armLeft,0,-.08,0,.22,.62,.24,M.blue,false);cube(armLeft,0,-.4,-.03,.25,.22,.27,M.skin,false);
cube(armRight,0,-.08,0,.22,.62,.24,M.blue,false);cube(armRight,0,-.4,-.03,.25,.22,.27,M.skin,false);
arms.add(armLeft,armRight);

const obstacleGroup=new THREE.Group();scene.add(obstacleGroup);
const obstacles=[];
const obstacleTypes=["bike","cart","fire","barricade"];
function buildObstacle(type,z,lane){
 const g=new THREE.Group();g.position.set(lane*3,0,z);
 if(type==="bike"){
  for(const x of [-.65,.65]){const w=new THREE.Mesh(new THREE.TorusGeometry(.42,.075,8,16),M.black);w.position.set(x,.48,0);w.rotation.y=Math.PI/2;g.add(w);}
  cube(g,0,.85,0,1.4,.09,.08,M.dark,false);cube(g,-.25,1.08,0,.08,.65,.08,M.dark,false);cube(g,.35,1.12,0,.08,.5,.08,M.dark,false);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.38,1.25,8),M.fire);flame.position.set(0,1.45,-.2);g.add(flame);
  const light=new THREE.PointLight(0xff4b12,1.6,5);light.position.y=1.4;g.add(light);
 }else if(type==="cart"){
  cube(g,0,.65,0,1.8,.9,1.1,M.wood,true);
  for(const x of [-.65,.65]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.13,10),M.dark);w.rotation.z=Math.PI/2;w.position.set(x,.25,.35);g.add(w);}
 }else if(type==="fire"){
  cube(g,0,.12,0,1.6,.2,1.4,M.dark,false);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(.25+Math.random()*.2,1.5+Math.random(),7),M.fire);f.position.set((Math.random()-.5)*1.1,.9,(Math.random()-.5)*.7);g.add(f);}
  const light=new THREE.PointLight(0xff4b10,2,7);light.position.y=1.5;g.add(light);
 }else{
  cube(g,0,1.05,0,2.5,2.1,.6,M.stone,true);
  cube(g,0,2.15,0,2.6,.18,.7,M.red,false);
 }
 obstacleGroup.add(g);return {group:g,type,lane,hit:false};
}
function fillObstacles(){
 for(let i=0;i<18;i++){
  const lane=[-1,0,1][Math.floor(Math.random()*3)];
  obstacles.push(buildObstacle(obstacleTypes[Math.floor(Math.random()*obstacleTypes.length)],-24-i*11,lane));
 }
}
fillObstacles();

function makePerson(x,z,shirt,kind=0,scale=1){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);
 cube(g,0,1.2,0,.72,.9,.42,mat(shirt),true);
 cube(g,0,1.92,0,.58,.58,.58,M.skin,true);
 cube(g,-.14,2,.3,.07,.07,.035,M.black,false);cube(g,.14,2,.3,.07,.07,.035,M.black,false);
 const leftArm=new THREE.Group();leftArm.position.set(-.48,1.55,0);cube(leftArm,0,-.34,0,.24,.72,.25,mat(shirt),false);g.add(leftArm);
 const rightArm=new THREE.Group();rightArm.position.set(.48,1.55,0);cube(rightArm,0,-.34,0,.24,.72,.25,mat(shirt),false);g.add(rightArm);
 const leftLeg=new THREE.Group();leftLeg.position.set(-.2,.78,0);cube(leftLeg,0,-.37,0,.28,.74,.32,M.pants,false);g.add(leftLeg);
 const rightLeg=new THREE.Group();rightLeg.position.set(.2,.78,0);cube(rightLeg,0,-.37,0,.28,.74,.32,M.pants,false);g.add(rightLeg);
 if(kind===1){const cape=cube(g,0,1.25,.27,.9,1.25,.08,M.red,false);cape.rotation.x=-.12;}
 if(kind===2){const hat=new THREE.Mesh(new THREE.ConeGeometry(.42,.72,8),M.gold);hat.position.y=2.55;g.add(hat);}
 if(kind===3)cube(g,0,1.98,.32,.72,.2,.12,M.gold,false);
 if(kind===4)cube(g,0,2.3,0,.7,.16,.7,M.green,false);
 g.userData={leftArm,rightArm,leftLeg,rightLeg,phase:Math.random()*6};
 scene.add(g);return g;
}
const chasers=[
 makePerson(-1.4,11,0x6b2c3c,1,1.12),makePerson(.1,13,0x304c8a,0,1.08),
 makePerson(1.5,15,0x4e6d46,2,1.05),makePerson(-2.1,17,0x6c6c70,3,1.12),
 makePerson(2.1,19,0x583c72,4,1.08),makePerson(0,21,0xa05c32,0,1.1)
];
const extras=[];
for(let i=0;i<10;i++)extras.push(makePerson((Math.random()-.5)*8,-28-Math.random()*100,[0x6b2c3c,0x304c8a,0x4e6d46,0x8a7147][i%4],i%5,.78+Math.random()*.22));

const player={lane:0,x:0,y:0,vx:0,vy:0,speed:10,stamina:100,sliding:0,lookX:0,lookY:0};
let running=false,paused=false,distance=0,last=performance.now(),elapsed=0,mouseLocked=false;
const keys={};
function startRun(){
 distance=0;elapsed=0;player.lane=0;player.x=0;player.y=0;player.vx=0;player.vy=0;player.stamina=100;player.sliding=0;player.lookX=0;player.lookY=0;
 obstacles.forEach(o=>obstacleGroup.remove(o.group));obstacles.length=0;fillObstacles();
 chasers.forEach((c,i)=>c.position.set([-1.4,.1,1.5,-2.1,2.1,0][i],0,11+i*2));
 $("distance").textContent="0 m";$("stamina-fill").style.width="100%";$("stamina-text").textContent="100%";
 $("menu").classList.add("hidden");$("gameover").classList.add("hidden");$("pause").classList.add("hidden");$("toast").classList.remove("fade");
 $("toast").textContent="RUN!";$("mission-sub").textContent="They're right behind you.";
 running=true;paused=false;canvas.requestPointerLock?.();
 setTimeout(()=>$("toast").classList.add("fade"),1300);
}
function endRun(won=false){
 running=false;document.exitPointerLock?.();
 $("end-eyebrow").textContent=won?"YOU MADE IT OUT":"THE CROWD CAUGHT UP";
 $("end-title").innerHTML=won?"YOU<br><em>ESCAPED.</em>":"RUN<br><em>ENDED.</em>";
 $("final-score").textContent="You made it "+Math.floor(distance)+" meters.";
 $("gameover").classList.remove("hidden");
}
function setPause(){
 if(!running)return;paused=!paused;$("pause").classList.toggle("hidden",!paused);
 if(paused)document.exitPointerLock?.();else canvas.requestPointerLock?.();
}
function jump(){if(player.y<=.01&&player.sliding<=0)player.vy=8.8;}
function slide(){if(player.y<=.1)player.sliding=.82;}
$("start").onclick=startRun;$("again").onclick=startRun;
document.addEventListener("pointerlockchange",()=>{
 mouseLocked=document.pointerLockElement===canvas;
 if(running&&!paused&&!mouseLocked){$("toast").textContent="CLICK TO CAPTURE MOUSE";$("toast").classList.remove("fade");}
});
document.addEventListener("mousemove",e=>{
 if(mouseLocked){player.lookX-=e.movementX*.0018;player.lookY=THREE.MathUtils.clamp(player.lookY-e.movementY*.0014,-.28,.28);}
});
document.addEventListener("keydown",e=>{
 if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
 if(e.code==="Escape"&&running){setPause();return;}
 if(!running||paused)return;
 if(!keys[e.code]){
  if(e.code==="Space")jump();
  if(e.code==="ShiftLeft"||e.code==="ShiftRight")slide();
 }
 keys[e.code]=true;
});
document.addEventListener("keyup",e=>{keys[e.code]=false;});
addEventListener("blur",()=>{Object.keys(keys).forEach(k=>keys[k]=false);});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running&&!paused)setPause();});
const mobileMoveKeys={left:"KeyA",right:"KeyD"};
document.querySelectorAll("[data-move]").forEach(b=>{
 let activeKey="";
 const release=()=>{if(activeKey){keys[activeKey]=false;activeKey="";}};
 b.addEventListener("pointerdown",e=>{
  e.preventDefault();if(!running||paused)return;const a=b.dataset.move;
  if(mobileMoveKeys[a]){activeKey=mobileMoveKeys[a];keys[activeKey]=true;b.setPointerCapture?.(e.pointerId);}
  if(a==="jump")jump();if(a==="slide")slide();
 });
 ["pointerup","pointercancel","lostpointercapture"].forEach(type=>b.addEventListener(type,release));
});
canvas.addEventListener("click",()=>{if(running&&!paused&&!mouseLocked)canvas.requestPointerLock?.();});
let touchLookPointer=null,touchLookX=0,touchLookY=0;
canvas.addEventListener("pointerdown",e=>{
 if(e.pointerType!=="touch"||!running||paused)return;
 touchLookPointer=e.pointerId;touchLookX=e.clientX;touchLookY=e.clientY;
 canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener("pointermove",e=>{
 if(touchLookPointer!==e.pointerId)return;
 const dx=e.clientX-touchLookX,dy=e.clientY-touchLookY;touchLookX=e.clientX;touchLookY=e.clientY;
 player.lookX-=dx*.004;player.lookY=THREE.MathUtils.clamp(player.lookY-dy*.003,-.28,.28);
});
["pointerup","pointercancel","lostpointercapture"].forEach(type=>canvas.addEventListener(type,()=>{
 touchLookPointer=null;
}));

function update(dt){
 if(!running||paused)return;
 elapsed+=dt;
 const sprint=(keys.ControlLeft||keys.ControlRight);
 player.speed=sprint&&player.stamina>0?13.5:10;
 if(sprint&&player.stamina>0)player.stamina=Math.max(0,player.stamina-24*dt);
 else player.stamina=Math.min(100,player.stamina+14*dt);
 const forward=(keys.KeyW||keys.ArrowUp?2.5:0)-(keys.KeyS||keys.ArrowDown?3.5:0);
 const travel=Math.max(5,player.speed+forward+Math.min(7,elapsed*.08));
 distance+=dt*travel;
 const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
 player.vx=THREE.MathUtils.damp(player.vx,strafe*8,14,dt);
 player.x=THREE.MathUtils.clamp(player.x+player.vx*dt,-5.7,5.7);
 if(player.vy!==0||player.y>0){player.vy-=22*dt;player.y+=player.vy*dt;if(player.y<0){player.y=0;player.vy=0;}}
 player.sliding=Math.max(0,player.sliding-dt);
 const back=keys.KeyQ?Math.PI:0;
 camera.position.set(player.x*.72+player.lookX*1.1,1.72+player.y-(player.sliding>0?.62:0)+player.lookY,0);
 camera.rotation.set(player.lookY*.55,player.lookX+back,0,"YXZ");
 const sway=Math.sin(elapsed*travel*.65)*.018;
 armLeft.rotation.z=sway;armRight.rotation.z=-sway;arms.visible=player.sliding<=0;
 for(const chunk of cityChunks){chunk.position.z+=travel*dt;if(chunk.position.z>22)chunk.position.z-=198;}
 for(const o of obstacles){
  o.group.position.z+=travel*dt;
  if(!o.hit&&o.group.position.z>-.9&&o.group.position.z<1.25&&Math.abs(o.group.position.x-player.x)<1.45){
   const safe=o.type==="barricade"?player.sliding>0:player.y>.82;
   if(!safe){
    o.hit=true;player.stamina=Math.max(0,player.stamina-42);distance=Math.max(0,distance-10);
    $("damage-flash").classList.remove("flash");void $("damage-flash").offsetWidth;$("damage-flash").classList.add("flash");
    o.group.position.z=4;
    if(player.stamina<=0){endRun(false);return;}
   }
  }
  if(o.group.position.z>13){
   o.group.position.z=-205-Math.random()*12;o.group.position.x=[-3,0,3][Math.floor(Math.random()*3)];
   o.lane=o.group.position.x/3;o.hit=false;
  }
 }
 chasers.forEach((c,i)=>{
  c.position.z=11+i*1.8-Math.min(7.5,elapsed*.085)+Math.sin(elapsed*3+i)*.22;
  c.position.x=THREE.MathUtils.damp(c.position.x,[-1.4,.1,1.5,-2.1,2.1,0][i]+Math.sin(elapsed*1.4+i)*.35,3,dt);
  c.rotation.y=Math.sin(elapsed*2+i)*.1;
  const u=c.userData,p=elapsed*travel*.5+u.phase;
  u.leftArm.rotation.x=Math.sin(p)*.7;u.rightArm.rotation.x=-Math.sin(p)*.7;
  u.leftLeg.rotation.x=-Math.sin(p)*.65;u.rightLeg.rotation.x=Math.sin(p)*.65;
 });
 extras.forEach(c=>{c.position.z+=travel*dt;if(c.position.z>18)c.position.z=-130-Math.random()*70;});
 if(elapsed>=90){endRun(true);return;}
 $("distance").textContent=Math.floor(distance)+" m";
 $("stamina-fill").style.width=player.stamina+"%";$("stamina-text").textContent=Math.floor(player.stamina)+"%";
}
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;
 update(dt);renderer.render(scene,camera);
}
requestAnimationFrame(animate);
addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));
});
