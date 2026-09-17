/* Local demonstration assets are deliberately separate from future AI providers. */
window.CanvasGeneration = (() => {
  const wait=(ms,signal)=>new Promise((resolve,reject)=>{if(signal.aborted)return reject(new DOMException('Cancelled','AbortError'));const abort=()=>{clearTimeout(timer);reject(new DOMException('Cancelled','AbortError'))},timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve()},ms);signal.addEventListener('abort',abort,{once:true})});
  const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('演示图片加载失败，请重试'));i.src=src});
  async function artwork(context,number){
    const source=await image('heytea-vi-tea.png'),spec=context.outputSpec;
    const ratio=spec?spec.width/spec.height:0.72,w=900,h=Math.round(w/Math.max(.25,Math.min(4,ratio)));
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');
    const t=context.designSystem?.tokens||{},dark=number%3===2,accent=t.secondary||'#b9cbab',ink=t.ink||'#202620',background=t.background||'#fff';
    c.fillStyle=dark?ink:background;c.fillRect(0,0,w,h);
    const photoY=h*.33,photoH=h*.49,photoW=w*.82,scale=Math.max(photoW/source.width,photoH/source.height);
    c.save();c.beginPath();c.rect(w*.09,photoY,photoW,photoH);c.clip();c.drawImage(source,w*.09+(photoW-source.width*scale)/2,photoY+(photoH-source.height*scale)/2,source.width*scale,source.height*scale);c.restore();
    c.fillStyle=dark?'#fff':ink;c.font='500 24px Arial';c.fillText('STUDIO / DAILY RITUAL',w*.09,h*.065);
    c.font='500 '+Math.min(132,h*.13)+'px Arial';c.fillText(number%3===0?'Slow days.':'A little tea.',w*.08,h*.20);
    c.font='24px Arial';c.fillText('Fresh perspectives, every day.',w*.09,h*.265);
    c.fillStyle=accent;c.fillRect(w*.09,h*.86,w*.1,5);c.fillStyle=dark?'#fff':ink;c.font='500 26px Arial';c.fillText('JASMINE / 01',w*.09,h*.915);
    c.font='16px Arial';c.fillText('VISUAL STUDY     /     '+String(number).padStart(2,'0'),w*.09,h*.957);
    const flat=canvas.toDataURL('image/png');
    const mock=document.createElement('canvas');mock.width=1100;mock.height=1000;const m=mock.getContext('2d');m.fillStyle='#eef0ec';m.fillRect(0,0,1100,1000);
    // A pre-rendered concept of the same artwork, not an AI-generated model.
    m.save();m.translate(295,170);m.shadowColor='#19201925';m.shadowBlur=45;m.shadowOffsetY=35;m.fillStyle='#fff';m.fillRect(0,0,420,680);m.restore();
    m.fillStyle=accent;m.beginPath();m.moveTo(715,170);m.lineTo(805,115);m.lineTo(805,795);m.lineTo(715,850);m.closePath();m.fill();
    m.fillStyle='#f9faf7';m.beginPath();m.moveTo(295,170);m.lineTo(385,115);m.lineTo(805,115);m.lineTo(715,170);m.closePath();m.fill();m.drawImage(canvas,295,170,420,680);
    return {flat,face:flat,concept:spec?flat:mock.toDataURL('image/png'),width:w,height:h,model:{kind:spec?'plane':'box',ratio:w/h,sideColor:accent},demo:true};
  }
  async function flatLayout(version){
    const face=version.face||version.flat;if(version.model.kind!=='box')return {face,flat:face,model:version.model};
    const art=await image(face),w=art.width,h=art.height,depth=Math.round(h*.7/3),c=document.createElement('canvas');c.width=2*w+2*depth;c.height=h+2*depth;
    const ctx=c.getContext('2d');ctx.fillStyle=version.model.sideColor||'#b9cbab';
    ctx.fillRect(0,depth,depth,h);ctx.fillRect(depth+w,depth,depth,h);ctx.fillRect(depth,0,w,depth);ctx.fillRect(depth,depth+h,w,depth);
    ctx.drawImage(art,depth,depth,w,h);ctx.drawImage(art,2*depth+w,depth,w,h);
    ctx.strokeStyle='#6b75664d';ctx.lineWidth=1;ctx.setLineDash([7,7]);
    for(const x of [depth,depth+w,2*depth+w]){ctx.beginPath();ctx.moveTo(x,depth);ctx.lineTo(x,depth+h);ctx.stroke()}
    for(const y of [depth,depth+h]){ctx.beginPath();ctx.moveTo(depth,y);ctx.lineTo(depth+w,y);ctx.stroke()}
    return {face,flat:c.toDataURL('image/png'),width:c.width,height:c.height,model:version.model,flatLayout:'box-net-v1'};
  }
  const demo={
    async concept(context,{signal,number}){await wait(1250,signal);const result=await artwork(context,number);if(signal.aborted)throw new DOMException('Cancelled','AbortError');return result},
    async convert(context,{signal,version}){await wait(1400,signal);const result=await flatLayout(version);if(signal.aborted)throw new DOMException('Cancelled','AbortError');return result},
    async regenerate(context,options){return this.concept(context,options)},
    async edit(context,options){return this.concept(context,options)}
  };
  const pending=async(context,{signal})=>{await wait(650,signal);return {status:'awaiting-api',context}};
  const unavailable={concept:pending,convert:pending,regenerate:pending,edit:pending};
  return {flatLayout,provider(mode){return mode==='demo'?demo:unavailable}};
})();
