import { useEffect, useRef, useState } from 'react'

declare global { interface Window { THREE?: any } }
type Props = {
  blueName:string; redName:string; blueImage:string; redImage:string;
  onWin:(winner:'blue'|'red')=>void;
  onExit:()=>void;
}

function makeFighter(T:any, side:'blue'|'red') {
  const root = new T.Group()
  const rig = new T.Group()
  root.add(rig)
  const blue=side==='blue'
  const primary=blue?0x123f91:0x811d36
  const accent=blue?0x20aaff:0xff4c3e
  const glow=blue?0x43d8ff:0xff7651
  const dark=0x101827
  const mat=(c:number,metal=0.45,rough=.3,emissive=0)=>new T.MeshStandardMaterial({color:c,metalness:metal,roughness:rough,emissive,emissiveIntensity:emissive?1.1:0})
  const armor=mat(primary,.72,.24), trim=mat(accent,.68,.22,accent), black=mat(dark,.35,.38)
  const skin=mat(blue?0xb98768:0xd59a76,.08,.55), light=mat(glow,.25,.2,glow)
  const mesh=(geo:any,m:any,parent:any,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  const sphere=(parent:any,r:number,m:any,x:number,y:number,z:number,sx=1,sy=1,sz=1)=>{const o=mesh(new T.SphereGeometry(r,24,18),m,parent,x,y,z);o.scale.set(sx,sy,sz);return o}
  const cylinder=(parent:any,rt:number,rb:number,h:number,m:any,x:number,y:number,z:number)=>mesh(new T.CylinderGeometry(rt,rb,h,18),m,parent,x,y,z)
  // boots and articulated legs
  const legs:any[]=[]
  for(const x of [-.22,.22]){
    const hip=new T.Group();hip.position.set(x,1.05,0);rig.add(hip)
    cylinder(hip,.17,.22,.48,armor,0,-.25,0)
    sphere(hip,.17,trim,0,-.5,.015,1,.72,1)
    const shin=new T.Group();shin.position.set(0,-.52,0);hip.add(shin)
    cylinder(shin,.115,.16,.48,armor,0,-.23,0)
    sphere(shin,.14,trim,0,-.45,.02,1,.65,1)
    const boot=mesh(new T.BoxGeometry(.31,.2,.48),black,shin,0,-.58,.1);boot.rotation.x=-.08
    mesh(new T.BoxGeometry(.27,.055,.43),light,shin,0,-.5,.15)
    legs.push({hip,shin})
  }
  // torso with layered chest armour
  const torso=new T.Group();torso.position.y=1.55;rig.add(torso)
  sphere(torso,.43,armor,0,0,0,.9,1.12,.62)
  sphere(torso,.34,trim,0,.12,.19,.98,.78,.45)
  mesh(new T.BoxGeometry(.47,.17,.12),black,torso,0,-.25,.39)
  sphere(torso,.13,light,0,.04,.48,1,1,.35)
  for(const x of [-.31,.31]){
    sphere(torso,.22,trim,x,.32,0,1.25,.78,1.1)
    mesh(new T.BoxGeometry(.12,.34,.24),black,torso,x,-.08,.34)
  }
  // waist, belt and emblem
  mesh(new T.BoxGeometry(.58,.19,.48),black,rig,0,1.12,0)
  mesh(new T.BoxGeometry(.22,.16,.08),light,rig,0,1.12,.27)
  // head, jaw, eyes, mask, hair/helmet
  const head=new T.Group();head.position.set(0,2.35,.015);rig.add(head)
  sphere(head,.265,skin,0,0,0,.88,1.08,.82)
  sphere(head,.275,armor,0,.13,-.015,1.03,.62,.93)
  sphere(head,.105,skin,0,-.16,.11,1,.65,.8)
  mesh(new T.BoxGeometry(.43,.095,.13),trim,head,0,.015,.218)
  for(const x of [-.095,.095]) sphere(head,.035,light,x,.015,.29,1,.6,.45)
  // swept hair spikes
  for(let i=0;i<7;i++){const sp=mesh(new T.ConeGeometry(.09,.27,7),mat(blue?0x071d3c:0x260b20,.25,.4),head,(i-3)*.07,.29-Math.abs(i-3)*.025,-.015);sp.rotation.z=(i-3)*-.18-.25}
  // arms with shoulder, upper arm, forearm and fists
  const arms:any[]=[]
  for(const x of [-.49,.49]){
    const arm=new T.Group();arm.position.set(x,1.86,0);rig.add(arm)
    sphere(arm,.2,trim,0,0,0,1,1,.95)
    cylinder(arm,.13,.17,.42,armor,0,-.24,0)
    sphere(arm,.135,black,0,-.45,.015)
    const fore=new T.Group();fore.position.set(0,-.46,.015);arm.add(fore)
    cylinder(fore,.105,.135,.38,trim,0,-.18,.02)
    mesh(new T.BoxGeometry(.22,.13,.23),black,fore,0,-.34,.04)
    sphere(fore,.14,armor,0,-.43,.09,1,.9,1.1)
    for(let k=0;k<3;k++)mesh(new T.BoxGeometry(.045,.12,.13),light,fore,(k-1)*.065,-.44,.205)
    arms.push({arm,fore})
  }
  // shoulder fins and flowing cape
  const cape=mesh(new T.ConeGeometry(.48,1.08,5),mat(blue?0x09234b:0x3d1025,.4,.4),rig,0,1.55,-.42);cape.rotation.x=Math.PI
  const capeEdge=mesh(new T.ConeGeometry(.49,.16,5),trim,rig,0,1.02,-.43);capeEdge.rotation.x=Math.PI
  // energy shoulder rings
  for(const x of [-.51,.51]){const ring=mesh(new T.TorusGeometry(.16,.035,8,20),light,rig,x,1.86,.03);ring.rotation.y=Math.PI/2}
  root.userData={rig,torso,head,arms,legs,cape,side,attack:'',attackAt:0,hitAt:0,stun:0,vy:0,onGround:true,health:100,energy:100,cooldown:0,walk:0,flash:0}
  root.scale.x=blue?1:-1
  root.rotation.y=blue?.32:-.32
  root.position.set(blue?-3.5:3.5,0,0)
  return root
}

export default function ThreeDuelScene({blueName,redName,blueImage,redImage,onWin,onExit}:Props){
 const host=useRef<HTMLDivElement>(null)
 const winRef=useRef(onWin); winRef.current=onWin
 const [hud,setHud]=useState({blue:100,red:100,blueEnergy:100,redEnergy:100,time:99,message:'FIGHT!',winner:''})
 const [paused,setPaused]=useState(false)
 const [round,setRound]=useState(1)
 const pausedRef=useRef(false); pausedRef.current=paused
 useEffect(()=>{
  const T=window.THREE,el=host.current
  if(!el)return
  if(!T){el.textContent='3D ENGINE DID NOT LOAD — refresh and check your internet connection.';return}
  const scene=new T.Scene();scene.background=new T.Color(0x071329);scene.fog=new T.Fog(0x071329,18,48)
  const camera=new T.PerspectiveCamera(34,1,.1,100);camera.position.set(0,3.4,19);camera.lookAt(0,1.55,0)
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;el.appendChild(renderer.domElement)
  scene.add(new T.HemisphereLight(0xa9d4ff,0x171027,2))
  const key=new T.DirectionalLight(0xffffff,3.3);key.position.set(-4,9,9);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key)
  const blueLight=new T.PointLight(0x168cff,55,13);blueLight.position.set(-4,3,2);scene.add(blueLight)
  const redLight=new T.PointLight(0xff3c2c,55,13);redLight.position.set(4,3,2);scene.add(redLight)
  const floor=new T.Mesh(new T.PlaneGeometry(32,22),new T.MeshStandardMaterial({color:0x101d34,metalness:.7,roughness:.3}));floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor)
  for(let i=0;i<18;i++){const x=-13+i*1.55,h=2.5+(i*7%6);const b=new T.Mesh(new T.BoxGeometry(1.05,h,1.2),new T.MeshStandardMaterial({color:i%2?0x172b4b:0x202849,metalness:.45,roughness:.5}));b.position.set(x,h/2-0.1,-5);scene.add(b);for(let j=0;j<Math.floor(h*1.4);j++){const w=new T.Mesh(new T.BoxGeometry(.12,.12,.025),new T.MeshBasicMaterial({color:i%3===0?0x269fff:0x8d65ff}));w.position.set(x-.25+(j%3)*.24,.4+Math.floor(j/3)*.35,-4.37);scene.add(w)}}
  const arena=new T.Mesh(new T.CircleGeometry(7,80),new T.MeshStandardMaterial({color:0x142b49,metalness:.72,roughness:.3}));arena.rotation.x=-Math.PI/2;arena.position.y=-.045;arena.receiveShadow=true;scene.add(arena)
  const ring=(r:number,color:number)=>{const o=new T.Mesh(new T.TorusGeometry(r,.035,10,100),new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.7,metalness:.7}));o.rotation.x=Math.PI/2;o.position.y=.005;scene.add(o)}
  ring(5.8,0x268cff);ring(3.6,0xffa83d);ring(1.2,0x8c54ff)
  // vertical energy pylons
  for(const x of [-7.5,7.5]){const p=new T.Mesh(new T.CylinderGeometry(.12,.22,4.5,8),new T.MeshStandardMaterial({color:0x263e68,metalness:.8,roughness:.2,emissive:0x102d55}));p.position.set(x,2,-1);scene.add(p);const orb=new T.Mesh(new T.SphereGeometry(.24,16,12),new T.MeshBasicMaterial({color:x<0?0x26aaff:0xff4c32}));orb.position.set(x,4.3,-1);scene.add(orb)}
  const blue=makeFighter(T,'blue'),red=makeFighter(T,'red');scene.add(blue,red)
  const fighters=[blue,red],keys=new Set<string>(),projectiles:any[]=[],particles:any[]=[]
  let last=performance.now(),elapsed=0,uiAt=0,gameOver=false,notified=false,shake=0,announce='FIGHT!',raf=0
  const disposeObject=(o:any)=>{o.traverse((n:any)=>{if(n.geometry)n.geometry.dispose();if(n.material){if(Array.isArray(n.material))n.material.forEach((m:any)=>m.dispose());else n.material.dispose()}})}
  const burst=(pos:any,color:number,count=28)=>{for(let i=0;i<count;i++){const m=new T.Mesh(new T.SphereGeometry(.035+Math.random()*.055,7,6),new T.MeshBasicMaterial({color,transparent:true,opacity:1}));m.position.copy(pos);scene.add(m);particles.push({m,v:new T.Vector3((Math.random()-.5)*.32,Math.random()*.34,(Math.random()-.5)*.22),life:.8+Math.random()*.5})}}
  const fireball=(from:any,to:any,color:number,owner:any)=>{const g=new T.Group();const core=new T.Mesh(new T.SphereGeometry(.24,18,14),new T.MeshBasicMaterial({color}));g.add(core);const halo=new T.Mesh(new T.SphereGeometry(.42,16,12),new T.MeshBasicMaterial({color,transparent:true,opacity:.23}));g.add(halo);const light=new T.PointLight(color,8,4);g.add(light);g.position.copy(from);scene.add(g);projectiles.push({g,from:from.clone(),to:to.clone(),t:0,color,owner})}
  const damage=(attacker:any,target:any,amount:number,force:number,color:number)=>{if(target.userData.stun>0)return;target.userData.health=Math.max(0,target.userData.health-amount);target.userData.stun=.42;target.userData.flash=.25;target.position.x+=attacker.position.x<target.position.x?force:-force;target.userData.vy=force*.7;target.userData.onGround=false;target.userData.attack='hurt';target.userData.attackAt=elapsed;shake=.22;burst(new T.Vector3(target.position.x,1.65,.5),color,34);announce=amount>=20?'CRITICAL HIT!':'HIT!';}
  const doAttack=(fighter:any,kind:'punch'|'kick'|'special',opponent:any)=>{
   const u=fighter.userData;if(gameOver||pausedRef.current||u.stun>0||u.cooldown>0)return
   if(kind==='special'&&u.energy<35){announce='NOT ENOUGH ENERGY';return}
   u.attack=kind;u.attackAt=elapsed;u.cooldown=kind==='special'?1.2:kind==='kick'?.48:.32
   if(kind==='special'){u.energy-=35;const c=u.side==='blue'?0x22c9ff:0xff513e;const from=new T.Vector3(fighter.position.x+(u.side==='blue'?.7:-.7),1.65,.45);const to=new T.Vector3(opponent.position.x,1.55,.45);fireball(from,to,c,fighter);announce=u.side==='blue'?'THUNDER BLAST!':'INFERNO BLAST!';return}
   const distance=Math.abs(fighter.position.x-opponent.position.x)
   if(distance<2.15){const c=u.side==='blue'?0x48cfff:0xff7052;damage(fighter,opponent,kind==='kick'?11:8,kind==='kick'?.52:.32,c)}
   else announce='MISS!'
  }
  const keyMap=(e:KeyboardEvent)=>e.key.toLowerCase()
  const onDown=(e:KeyboardEvent)=>{const k=keyMap(e);if(['arrowleft','arrowright','arrowup',' '].includes(k))e.preventDefault();if(keys.has(k))return;keys.add(k);if(k==='f')doAttack(blue,'punch',red);if(k==='g')doAttack(blue,'kick',red);if(k==='h')doAttack(blue,'special',red);if(k==='j')doAttack(red,'punch',blue);if(k==='k')doAttack(red,'kick',blue);if(k==='l')doAttack(red,'special',blue);if(k==='escape')setPaused(v=>!v)}
  const onUp=(e:KeyboardEvent)=>keys.delete(keyMap(e))
  window.addEventListener('keydown',onDown);window.addEventListener('keyup',onUp)
  const resize=()=>{const w=el.clientWidth||900,h=el.clientHeight||560;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(el);resize()
  const animate=()=>{const now=performance.now(),dt=Math.min((now-last)/1000,.035);last=now;if(!pausedRef.current&&!gameOver){elapsed+=dt}
   if(!pausedRef.current&&!gameOver){
    for(const [idx,f] of fighters.entries()){
     const u=f.userData,blueSide=idx===0,dir=blueSide?1:-1,op=blueSide?red:blue
     u.cooldown=Math.max(0,u.cooldown-dt);u.stun=Math.max(0,u.stun-dt);u.flash=Math.max(0,u.flash-dt);u.energy=Math.min(100,u.energy+dt*5)
     const left=keys.has(blueSide?'a':'arrowleft'),right=keys.has(blueSide?'d':'arrowright'),jump=keys.has(blueSide?'w':'arrowup')
     let move=(right?1:0)-(left?1:0)
     if(move&&u.stun<=0){f.position.x+=move*dt*4.4;u.walk+=dt*10;u.rig.position.y=Math.abs(Math.sin(u.walk))*.07;u.legs[0].hip.rotation.z=Math.sin(u.walk)*.65;u.legs[1].hip.rotation.z=-Math.sin(u.walk)*.65;u.arms[0].arm.rotation.z=Math.sin(u.walk)*.35;u.arms[1].arm.rotation.z=-Math.sin(u.walk)*.35}
     else if(u.stun<=0){u.rig.position.y=Math.sin(elapsed*3+idx)*.035;u.legs.forEach((l:any)=>l.hip.rotation.x*=.8);u.arms.forEach((a:any)=>{a.arm.rotation.z*=.82;a.fore.rotation.z*=.82})}
     if(jump&&u.onGround&&u.stun<=0){u.vy=7.1;u.onGround=false;announce=blueSide?'PLAYER 1 JUMPS':'PLAYER 2 JUMPS'}
     if(!u.onGround){u.vy-=18*dt;f.position.y+=u.vy*dt;if(f.position.y<=0){f.position.y=0;u.vy=0;u.onGround=true;if(u.attack==='hurt'){u.attack='';}}}
     if(u.attack==='punch'||u.attack==='kick'||u.attack==='special'){
      const p=Math.min(1,(elapsed-u.attackAt)/(u.attack==='special'?.65:u.attack==='kick'?.34:.24))
      const swing=Math.sin(p*Math.PI)
      const a=u.arms[1];a.arm.rotation.z=-swing*(u.attack==='punch'?1.45:.25);a.fore.rotation.z=-swing*.25
      if(u.attack==='kick'){u.legs[1].hip.rotation.z=-swing*1.35}
      u.torso.rotation.z=(blueSide?1:-1)*swing*.12
      if(p>=1){u.attack='';u.arms.forEach((a:any)=>{a.arm.rotation.z=0;a.fore.rotation.z=0});u.legs.forEach((l:any)=>{l.hip.rotation.x=0;l.hip.rotation.z=0});u.torso.rotation.z=0}
     } else if(u.attack==='hurt'){u.torso.rotation.z=(blueSide?-.45:.45)*Math.max(0,u.stun*2);u.head.rotation.z=-u.torso.rotation.z*.3;if(u.stun<=0){u.attack='';u.torso.rotation.z=0;u.head.rotation.z=0}}
     u.cape.rotation.x=Math.PI+Math.sin(elapsed*4+idx)*.08
     f.position.x=Math.max(-6.1,Math.min(6.1,f.position.x))
    }
    // projectiles fly across the arena and hit the opposing fighter
    for(let i=projectiles.length-1;i>=0;i--){const q=projectiles[i];q.t+=dt*1.65;q.g.position.lerpVectors(q.from,q.to,Math.min(1,q.t));q.g.rotation.z+=dt*7;q.g.scale.setScalar(1+Math.sin(elapsed*25)*.13);if(q.t>=1){const target=q.owner===blue?red:blue;damage(q.owner,target,19,.82,q.color);burst(q.to,q.color,55);scene.remove(q.g);disposeObject(q.g);projectiles.splice(i,1)}}
    // keep fighters apart
    const dx=red.position.x-blue.position.x;if(dx<1.35){const overlap=1.35-dx;blue.position.x-=overlap/2;red.position.x+=overlap/2}
    if(elapsed>=99){gameOver=true;const winner=blue.userData.health>=red.userData.health?'blue':'red';announce='TIME UP!';if(!notified){notified=true;setHud(h=>({...h,winner}));winRef.current(winner)}}
    if(blue.userData.health<=0||red.userData.health<=0){gameOver=true;const winner=blue.userData.health>red.userData.health?'blue':'red';announce='KNOCKOUT!';if(!notified){notified=true;setHud(h=>({...h,winner}));winRef.current(winner)}}
   }
   for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.m.position.addScaledVector(p.v,dt*8);p.v.y-=dt*.7;p.m.scale.setScalar(Math.max(.001,p.life));p.m.material.opacity=Math.max(0,p.life);if(p.life<=0){scene.remove(p.m);disposeObject(p.m);particles.splice(i,1)}}
   if(shake>0)shake=Math.max(0,shake-dt)
   camera.position.x=(Math.random()-.5)*shake;camera.lookAt(0,1.45,0);renderer.render(scene,camera)
   if(now-uiAt>100){uiAt=now;const b=blue.userData,r=red.userData;setHud(h=>({...h,blue:b.health,red:r.health,blueEnergy:b.energy,redEnergy:r.energy,time:Math.max(0,Math.ceil(99-elapsed)),message:announce}))}
  }
  raf=requestAnimationFrame(animate)
  const cleanup=()=>{cancelAnimationFrame(raf);ro.disconnect();window.removeEventListener('keydown',onDown);window.removeEventListener('keyup',onUp);renderer.dispose();if(el.contains(renderer.domElement))el.removeChild(renderer.domElement)}
  return cleanup
 },[])
 return <div className="fighter-game">
  <div className="fighter-hud">
   <div className="fighter-side blue"><div className="fighter-title"><span>PLAYER 1</span><b>{blueName}</b></div><div className="fighter-health"><i style={{width:`${hud.blue}%`}}/></div><div className="fighter-energy"><i style={{width:`${hud.blueEnergy}%`}}/></div></div>
   <div className="fighter-clock"><b>{hud.time}</b><span>ROUND {round}</span></div>
   <div className="fighter-side red"><div className="fighter-title"><span>PLAYER 2</span><b>{redName}</b></div><div className="fighter-health"><i style={{width:`${hud.red}%`}}/></div><div className="fighter-energy"><i style={{width:`${hud.redEnergy}%`}}/></div></div>
  </div>
  <div className="fighter-canvas" ref={host}/>
  <div className="fighter-message">{hud.message}</div>
  <div className="fighter-controls"><div><b>PLAYER 1</b><span>A / D MOVE</span><span>W JUMP</span><span>F PUNCH · G KICK</span><span>H SPECIAL</span></div><div><b>PLAYER 2</b><span>← / → MOVE</span><span>↑ JUMP</span><span>J PUNCH · K KICK</span><span>L SPECIAL</span></div></div>
  {paused&&<div className="fighter-overlay"><div><h2>PAUSED</h2><button onClick={()=>setPaused(false)}>RESUME</button><button onClick={onExit}>EXIT ARENA</button></div></div>}

 </div>
}
