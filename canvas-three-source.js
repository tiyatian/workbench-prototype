import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export async function createPreview(host,version){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','可旋转的 3D 交付物预览');renderer.domElement.setAttribute('role','img');host.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=18;
  scene.add(new THREE.HemisphereLight(0xffffff,0xb5c0b0,3));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,6,5);scene.add(light);
  let texture,geometry,materials,object,disposed=false,frame;
  const render=()=>{if(disposed)return;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(render)};
  const fit=()=>{if(disposed)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;const distance=Math.max(1.7,1.7*version.model.ratio/camera.aspect)/Math.tan(THREE.MathUtils.degToRad(17.5));camera.position.set(version.model.kind==='box'?distance*.38:0,distance*.15,distance);controls.target.set(0,0,0);camera.updateProjectionMatrix();controls.update()};
  const resize=new ResizeObserver(fit);
  const dispose=()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();geometry?.dispose();texture?.dispose();materials?.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove()};
  try{
    texture=await new THREE.TextureLoader().loadAsync(version.face||version.flat);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const width=3*version.model.ratio,depth=version.model.kind==='box'?.7:.025;
    geometry=new THREE.BoxGeometry(width,3,depth);
    materials=Array.from({length:6},(_,i)=>new THREE.MeshStandardMaterial({color:i>=4?0xffffff:version.model.sideColor||'#e5e8e0',map:i>=4?texture:null,roughness:.85,metalness:0}));
    object=new THREE.Mesh(geometry,materials);scene.add(object);resize.observe(host);fit();render();
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dispatchEvent(new CustomEvent('previewerror',{detail:'3D 渲染已中断，请重新打开预览'}))});
    return {fit,dispose};
  }catch(error){dispose();throw error}
}

export async function unfoldPreview(host,version,{signal}={}){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','3D 包装展开为 2D 设计图');host.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100),resources=[],hinges=[];
  let frame,texture;
  const dispose=()=>{cancelAnimationFrame(frame);resources.forEach(r=>r.dispose());texture?.dispose();renderer.dispose();renderer.domElement.remove()};
  try{
    texture=await new THREE.TextureLoader().loadAsync(version.face||version.flat);texture.colorSpace=THREE.SRGBColorSpace;
    if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
    const w=version.model.ratio*3,h=3,d=.7,box=version.model.kind==='box';
    const front=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),side=new THREE.MeshBasicMaterial({color:version.model.sideColor||'#b9cbab',side:THREE.DoubleSide});resources.push(front,side);
    function panel(parent,width,height,x,y,material){const geometry=new THREE.PlaneGeometry(width,height);resources.push(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,0);parent.add(mesh);return mesh}
    const base=new THREE.Group();scene.add(base);panel(base,w,h,0,0,front);
    function hinge(parent,x,y,width,height,px,py,axis,angle,material=side){const group=new THREE.Group();group.position.set(x,y,0);parent.add(group);panel(group,width,height,px,py,material);hinges.push({group,axis,angle});return group}
    if(box){hinge(base,-w/2,0,d,h,-d/2,0,'y',-Math.PI/2);const right=hinge(base,w/2,0,d,h,d/2,0,'y',Math.PI/2);hinge(right,d,0,w,h,w/2,0,'y',Math.PI/2,front);hinge(base,0,h/2,w,d,0,d/2,'x',-Math.PI/2);hinge(base,0,-h/2,w,d,0,-d/2,'x',Math.PI/2)}
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    await new Promise((resolve,reject)=>{
      const abort=()=>{cancelAnimationFrame(frame);reject(new DOMException('Cancelled','AbortError'))};signal?.addEventListener('abort',abort,{once:true});
      const started=performance.now(),duration=reduce?1:1400;
      function draw(now){if(signal?.aborted)return abort();const progress=Math.min(1,(now-started)/duration),t=progress*progress*(3-2*progress);
        const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;
        const netWidth=box?2*w+2*d:w,netHeight=box?h+2*d:h,fit=Math.max(netHeight/2,netWidth/(2*camera.aspect))/Math.tan(THREE.MathUtils.degToRad(17.5))*1.12;
        const center=box?w*.5:0;camera.position.set((1-t)*w*1.5+t*center,(1-t)*h*.55,fit);camera.lookAt(t*center,0,0);camera.updateProjectionMatrix();
        hinges.forEach(({group,axis,angle})=>group.rotation[axis]=angle*(1-t));if(!box)base.rotation.y=(1-t)*-.6;
        renderer.render(scene,camera);host.dataset.progress=t.toFixed(3);
        if(progress<1)frame=requestAnimationFrame(draw);else{signal?.removeEventListener('abort',abort);resolve()}
      }frame=requestAnimationFrame(draw);
    });
    return {dispose};
  }catch(e){dispose();throw e}
}
