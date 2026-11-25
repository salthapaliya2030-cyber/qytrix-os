import "./styles.css";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const root = document.querySelector("#root");
root.innerHTML = `
  <main id="game">
    <canvas id="world"></canvas>
    <div class="vignette"></div>
    <header class="hud-top"><div class="brand">RUN FROM THE CHAOS <span>PARIS • 1789</span></div><div class="distance"><small>DISTANCE</small><b id="distance">0 m</b></div></header>
    <div class="crosshair"><i></i><i></i></div>
    <section class="mission"><div class="mission-tag">ESCAPE THE CITY</div><div class="mission-title">DON'T LOOK BACK.</div><p>Something is right behind you.</p></section>
    <section class="bottom-hud"><div class="stamina-wrap"><div class="stamina-label"><span>STAMINA</span><b id="stamina-text">100%</b></div><div class="stamina-track"><div id="stamina-fill"></div></div></div><div class="hint" id="hint">WASD MOVE <b>•</b> SPACE JUMP <b>•</b> SHIFT SLIDE <b>•</b> MOUSE LOOK</div></section>
    <div id="toast" class="toast">CLICK TO START</div>
    <section id="menu" class="screen">
      <div class="menu-card"><div class="eyebrow">A MULTIVERSE CHASE GAME</div><h1>PARIS<br><em>RUNAWAY.</em></h1><p>One city. A thousand weirdos. One very bad day.</p><button id="start">START RUN <span>→</span></button><div class="controls"><span>WASD / ARROWS <b>MOVE</b></span><span>SPACE <b>JUMP</b></span><span>SHIFT <b>SLIDE</b></span><span>ESC <b>PAUSE</b></span></div><small>BEST PLAYED IN FULLSCREEN • DESKTOP CONTROLS</small></div>
    </section>
    <section id="gameover" class="screen hidden"><div class="menu-card"><div class="eyebrow">THE CROWD CAUGHT UP</div><h1>RUN<br><em>ENDED.</em></h1><p id="final-score">You made it 0 meters.</p><button id="again">TRY AGAIN <span>↻</span></button></div></section>
    <div id="pause" class="pause hidden">PAUSED <small>press esc to continue</small></div>
    <div class="mobile-controls"><button data-move="left">←</button><button data-move="right">→</button><button data-move="jump">↑</button><button data-move="slide">↓</button></div>
  </main>`;

const canvas = document.querySelector("#world");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9aa8b2);
scene.fog = new THREE.Fog(0x9aa8b2, 24, 155);
const camera = new THREE.PerspectiveCamera(76, innerWidth / innerHeight, .1, 260);
camera.position.set(0, 1.72, 5);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
scene.add(new THREE.HemisphereLight(0xdcecff, 0x514039, 2.0));
const sun = new THREE.DirectionalLight(0xffd5a3, 2.1);
sun.position.set(-16, 30, 12); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024); scene.add(sun);

const mat = (color, roughness=.9, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const materials = {
 road:mat(0x34383a), stone:mat(0x8a8276), dark:mat(0x292b2d), plaster:mat(0xc2ad8d),
 plaster2:mat(0x8d8a80), roof:mat(0x49494b), wood:mat(0x60432f), window:mat(0x263b46,.5),
 fire: new THREE.MeshStandardMaterial({color:0xff6b19,emissive:0xff3b00,emissiveIntensity:2}),
 gold:mat(0xd7a54b,.45), red:mat(0x9d2823), blue:mat(0x355a83), green:mat(0x496a49)
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
function cube(parent, x,y,z,sx,sy,sz, material, shadow=true) {
 const m=new THREE.Mesh(boxGeo,material); m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;
}
const ground=cube(scene,0,-.35,-82,18,.7,190,materials.road); ground.receiveShadow=true;
for(let x of [-9.2,9.2]) cube(scene,x,4,-82,.5,9,190,materials.stone,false);
for(let x of [-5.5,5.5]) { cube(scene,x,.015,-82,.12,.03,190,mat(0xb9a88c),false); }
for(let z=8;z>-175;z-=9){
 for(const side of [-1,1]){
  const width=3.1+Math.random()*1.5, height=7+Math.random()*7, depth=7+Math.random()*2;
  const wallMat=Math.random()>.5?materials.plaster:materials.plaster2;
  const building=new THREE.Group();building.position.set(side*(7.2+width/2),0,z);
  cube(building,0,height/2,0,width,height,depth,wallMat);
  cube(building,0,height+.18,0,width+.35,.35,depth+.35,materials.roof);
  for(let yy=2.1;yy<height-1;yy+=2.6) for(let xx=-width/2+.7;xx<width/2-.3;xx+=1.35){
    cube(building,xx,yy,depth/2+.025,.65,1.15,.08,materials.dark,false);
    cube(building,xx,yy,depth/2+.075,.48,.88,.04,materials.window,false);
    cube(building,xx,yy+.6,depth/2+.12,.8,.1,.2,materials.stone,false);
  }
  scene.add(building);
 }
}
// street lamps, hanging flags and crates
const props=[];
for(let z=4;z>-180;z-=17){
 for(const side of [-1,1]){
  const x=side*5.8;
  cube(scene,x,2.2,z,.13,4.4,.13,materials.dark);
  cube(scene,x-side*.45,4.3,z,.95,.12,.12,materials.dark);
  const glow=new THREE.PointLight(0xffb45d,.8,8);glow.position.set(x-side*.5,4,z);scene.add(glow);
  if(Math.random()>.35){const crate=cube(scene,side*(3.6+Math.random()),.65,z-4,.9,1.3,.9,materials.wood);props.push(crate);}
 }
}
// background skyline
for(let i=0;i<30;i++){const h=12+Math.random()*24;cube(scene,(Math.random()-.5)*100,h/2,-100-Math.random()*100,5,h,5,materials.plaster2,false);}

const player={lane:0,x:0,y:0,vy:0,speed:10,stamina:100,sliding:0,jumping:false,lookX:0,lookY:0};
const obstacles=[];
const obstacleGroup=new THREE.Group();scene.add(obstacleGroup);
function makeObstacle(type,z,lane){
 const g=new THREE.Group();g.position.set(lane*3,0,z);
 if(type==="bike"){
  const frame=mat(0x272a2b,.55,.3), wheel=mat(0x111315,.5);
  for(const x of [-.65,.65]){const w=new THREE.Mesh(new THREE.TorusGeometry(.42,.07,8,16),wheel);w.position.set(x,.48,0);w.rotation.y=Math.PI/2;g.add(w);}
  cube(g,0,.85,0,1.4,.09,.08,frame);cube(g,-.25,1.08,0,.08,.65,.08,frame);cube(g,.35,1.12,0,.08,.5,.08,frame);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.38,1.2,8),materials.fire);flame.position.set(0,1.5,-.2);g.add(flame);
  const light=new THREE.PointLight(0xff4b12,2,5);light.position.y=1.4;g.add(light);
 }else if(type==="cart"){
  cube(g,0,.65,0,1.8,.9,1.1,materials.wood);for(let x of [-.65,.65]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.13,12),materials.dark);w.rotation.z=Math.PI/2;w.position.set(x,.25,.35);g.add(w);}
 }else if(type==="fire"){
  cube(g,0,.12,0,1.6,.2,1.4,materials.dark);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(.25+Math.random()*.2,1.5+Math.random(),7),materials.fire);f.position.set((Math.random()-.5)*1.1,.9,(Math.random()-.5)*.7);g.add(f);}
  const l=new THREE.PointLight(0xff4b10,2.5,8);l.position.y=1.5;g.add(l);
 }else{
  cube(g,0,.8,0,2.3,1.6,.55,materials.stone);
  cube(g,0,1.7,0,2.4,.18,.7,materials.red);
 }
 obstacleGroup.add(g);obstacles.push({group:g,type,lane,hit:false});
}
const types=["bike","cart","fire","barricade"];
function fillObstacles(){for(let i=0;i<18;i++)makeObstacle(types[Math.floor(Math.random()*types.length)],-20-i*10,[-1,0,1][Math.floor(Math.random()*3)]);}
fillObstacles();

// Procedural chase crew: deliberately original cartoon silhouettes.
const crowd=new THREE.Group();scene.add(crowd);
function person(x,y,z,shirt,kind=0,scale=1){
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);
 const body=mat(shirt), skin=mat(0xc58f69), pants=mat(0x252b35), cape=mat(kind===1?0x8d1e26:0x25202d);
 cube(g,0,1.05,0,.65,.85,.4,body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.27,12,10),skin);head.position.y=1.68;g.add(head);
 cube(g,0,.42,0,.23,.8,.25,pants);
 cube(g,-.42,1.05,0,.2,.75,.22,body);cube(g,.42,1.05,0,.2,.75,.22,body);
 if(kind===1){const c=cube(g,0,1.05,.28,.8,1.15,.08,cape);c.rotation.x=-.15;}
 if(kind===2){const hat=new THREE.Mesh(new THREE.ConeGeometry(.42,.7,8),materials.gold);hat.position.y=2.15;g.add(hat);}
 if(kind===3){const ears=cube(g,0,1.9,0,.7,.16,.2,materials.dark);ears.position.y=1.92;}
 crowd.add(g);return g;
}
const chasers=[
 person(-1.2,0,-11,0x6b2c3c,1,1.15),person(.1,0,-12,0x304c8a,0,1.1),
 person(1.35,0,-13,0x4e6d46,2,1.05),person(-2.1,0,-14,0x6c6c70,3,1.15),
 person(2.1,0,-15,0x583c72,1,1.2),person(0,0,-17,0xa05c32,0,1.1)
];
const nameTags=["CAPE GUY","WIFI WIZARD","FROG KNIGHT","DISCOUNT CYBORG","SPACE TOURIST","DRAMATIC VAMPIRE"];
// distant crowd extras
for(let i=0;i<12;i++)person((Math.random()-.5)*8,0,-25-Math.random()*100,[0x6b2c3c,0x304c8a,0x4e6d46,0x8a7147][i%4],i%4,.8+Math.random()*.35);

let running=false,paused=false,gameEnded=false,distance=0,last=performance.now(),elapsed=0,mouseLocked=false;
const keys={};
const $=id=>document.getElementById(id);
function startRun(){distance=0;elapsed=0;player.lane=0;player.x=0;player.y=0;player.vy=0;player.stamina=100;player.sliding=0;gameEnded=false;obstacles.forEach(o=>obstacleGroup.remove(o.group));obstacles.length=0;fillObstacles();chasers.forEach((c,i)=>c.position.set([-1.2,.1,1.35,-2.1,2.1,0][i],0,-11-i));$("menu").classList.add("hidden");$("gameover").classList.add("hidden");$("pause").classList.add("hidden");running=true;paused=false;canvas.requestPointerLock?.();$("toast").textContent="RUN!";setTimeout(()=>$("toast").classList.add("fade"),1100);}
function endRun(){running=false;gameEnded=true;document.exitPointerLock?.();$("final-score").textContent="You made it "+Math.floor(distance)+" meters."; $("gameover").classList.remove("hidden");}
function setPause(){if(!running)return;paused=!paused;$("pause").classList.toggle("hidden",!paused);if(paused)document.exitPointerLock?.();else canvas.requestPointerLock?.();}
$("start").onclick=startRun;$("again").onclick=startRun;
document.addEventListener("pointerlockchange",()=>{mouseLocked=document.pointerLockElement===canvas;if(running&&!paused&&!mouseLocked)$("toast").classList.remove("fade");});
document.addEventListener("mousemove",e=>{if(mouseLocked){player.lookX-=e.movementX*.0018;player.lookY=Math.max(-.35,Math.min(.35,player.lookY-e.movementY*.0014));}});
document.addEventListener("keydown",e=>{keys[e.code]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();if(e.code==="Escape"&&running)setPause();if(!running||paused)return;if(e.code==="ArrowLeft"||e.code==="KeyA")player.lane=Math.max(-1,player.lane-1);if(e.code==="ArrowRight"||e.code==="KeyD")player.lane=Math.min(1,player.lane+1);if(e.code==="Space"&&player.y<=.01&&!player.sliding){player.vy=8.5;}if(e.code==="ShiftLeft"||e.code==="ShiftRight")player.sliding=.75;});
document.addEventListener("keyup",e=>keys[e.code]=false);
document.querySelectorAll("[data-move]").forEach(b=>{const action=b.dataset.move;b.addEventListener("pointerdown",e=>{e.preventDefault();if(action==="left")player.lane=Math.max(-1,player.lane-1);if(action==="right")player.lane=Math.min(1,player.lane+1);if(action==="jump"&&player.y<=.01)player.vy=8.5;if(action==="slide")player.sliding=.75;});});
canvas.addEventListener("click",()=>{if(running&&!paused&&!mouseLocked)canvas.requestPointerLock?.();});

function update(dt){
 if(!running||paused)return;
 elapsed+=dt;distance+=dt*(player.speed+Math.min(8,elapsed*.12));
 player.x=THREE.MathUtils.damp(player.x,player.lane*3,12,dt);
 if(player.vy!==0||player.y>0){player.vy-=21*dt;player.y+=player.vy*dt;if(player.y<0){player.y=0;player.vy=0;}}
 player.sliding=Math.max(0,player.sliding-dt);
 const sprint=keys["ControlLeft"]||keys["ControlRight"];
 if(sprint&&player.stamina>0){player.stamina=Math.max(0,player.stamina-25*dt);player.speed=13.5;}else{player.stamina=Math.min(100,player.stamina+13*dt);player.speed=10;}
 camera.position.x=player.x*.72+player.lookX*1.8;
 camera.position.y=1.72+player.y-(player.sliding>0?.65:0)+player.lookY;
 camera.rotation.set(player.lookY*.35,player.lookX,0,"YXZ");
 for(const o of obstacles){
  o.group.position.z+=dt*(player.speed+Math.min(8,elapsed*.12));
  if(!o.hit&&o.group.position.z>-.9&&o.group.position.z<1.3&&Math.abs(o.group.position.x-player.x)<1.55){
   const safe=(o.type==="barricade"&&player.y>1.15)||(o.type!=="barricade"&&player.sliding>0);
   if(!safe){o.hit=true;player.stamina=Math.max(0,player.stamina-38);distance=Math.max(0,distance-12);o.group.position.z=4;if(player.stamina<=0)endRun();}
  }
 }
 for(const o of obstacles){if(o.group.position.z>9){o.group.position.z=-175-Math.random()*22;o.group.position.x=[-3,0,3][Math.floor(Math.random()*3)];o.lane=o.group.position.x/3;o.type=types[Math.floor(Math.random()*types.length)];}}
 chasers.forEach((c,i)=>{c.position.z=-11-i*.8+Math.sin(elapsed*3+i)*.25+Math.min(5,elapsed*.025);c.position.x=THREE.MathUtils.damp(c.position.x,Math.sin(elapsed*1.7+i)*.55,2,dt);c.rotation.y=Math.sin(elapsed*2+i)*.12;});
 if(elapsed>90)endRun();
 $("distance").textContent=Math.floor(distance)+" m";$("stamina-fill").style.width=player.stamina+"%";$("stamina-text").textContent=Math.floor(player.stamina)+"%";
}
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;update(dt);renderer.render(scene,camera);}
requestAnimationFrame(animate);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));});
