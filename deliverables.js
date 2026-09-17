(() => {
'use strict';
const host=document.querySelector('#deliverables .inner'),D=window.DSData;
const css=document.createElement('link');css.rel='stylesheet';css.href='deliverables.css';document.head.append(css);
const categories=['All','Presentations & Documents','Graphic Design','Event Materials','Merchandise','Cards','Office'];
const builtins=[
 ['wide','16:9 Widescreen','Presentation',1920,1080,'px',[1]],
 ['standard','4:3 Standard','Presentation',1440,1080,'px',[1]],
 ['a4p','A4 Portrait','Document',210,297,'mm',[1,6]],
 ['a4l','A4 Landscape','Document',297,210,'mm',[1,6]],
 ['letter','Letter Portrait','Document',215.9,279.4,'mm',[1,6]],
 ['screen','Screen Document','Document',1440,1920,'px',[1]],
 ['a2p','A2 Portrait','Image / Poster',420,594,'mm',[2,3]],
 ['a2l','A2 Landscape','Image / Poster',594,420,'mm',[2,3]]
].map(([id,name,type,w,h,unit,groups])=>({id,name,type,w,h,unit,groups}));
let custom=[],category=0;try{custom=JSON.parse(localStorage.getItem('workbench-deliverable-specs')||'[]').filter(valid)}catch(e){}
function valid(s){return s&&typeof s.name==='string'&&s.name.trim().length>0&&s.name.length<=100&&typeof s.type==='string'&&s.type.length<=60&&Number.isFinite(s.w)&&s.w>0&&s.w<=10000&&Number.isFinite(s.h)&&s.h>0&&s.h<=10000&&['px','mm'].includes(s.unit)&&Array.isArray(s.groups)&&s.groups.every(g=>Number.isInteger(g)&&g>=1&&g<=6)}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
const button=(label,fn,cls)=>{const n=el('button',label,cls);n.type='button';n.onclick=fn;return n};
host.replaceChildren();const header=el('header',undefined,'de-header'),heading=el('div',undefined,'de-heading'),title=el('h1','Deliverables'),count=el('span');heading.append(title,count);const imp=button('',()=>upload.click(),'de-import'),icon=el('i');icon.dataset.lucide='plus';imp.append(icon,document.createTextNode('Import'));header.append(heading,imp);
const description=el('p','The deliverables UseIt can plan and produce. A deliverable type defines the available crafts and output formats; a variant defines the physical form and the size of each face.','de-description');
const tabs=el('nav',undefined,'de-tabs');tabs.setAttribute('aria-label','物料分类');const grid=el('div',undefined,'de-grid');host.append(header,description,tabs,grid);
const dialog=el('dialog',undefined,'de-dialog');dialog.setAttribute('aria-label','物料规格');document.body.append(dialog);const upload=el('input');upload.type='file';upload.accept='.json,application/json';upload.hidden=true;document.body.append(upload);
function preview(s){const scene=el('div',undefined,'de-preview');scene.classList.toggle('portrait',s.h>s.w);const paper=el('div',undefined,'de-paper');paper.style.aspectRatio=`${s.w}/${s.h}`;paper.classList.toggle('landscape',s.w>s.h);const bar=el('span',undefined,'de-paper-accent'),h=el('b',s.type==='Document'?'DOCUMENT\nTITLE':'A NEW\nPERSPECTIVE');paper.append(bar,h);if(s.type!=='Document'){const img=new Image();img.src='heytea-vi-tea.png';img.alt='';paper.append(img)}for(let i=0;i<4;i++)paper.append(el('span',undefined,'de-paper-line'));scene.append(paper);return scene}
function render(){const all=[...builtins,...custom];count.textContent=all.length+' variants';tabs.replaceChildren();categories.forEach((name,i)=>{const amount=i===0?all.length:all.filter(s=>s.groups.includes(i)).length,b=button('',()=>{category=i;render()},i===category?'active':'');b.setAttribute('aria-pressed',String(i===category));b.append(document.createTextNode(name));if(i)b.append(el('small',amount));tabs.append(b)});grid.replaceChildren();const visible=all.filter(s=>category===0||s.groups.includes(category));if(!visible.length){const empty=el('div','暂无此类规格','de-empty');empty.append(button('Import',()=>upload.click()));grid.append(empty)}visible.forEach(s=>{const card=button('',()=>show(s),'de-card');card.append(preview(s));const meta=el('div',undefined,'de-meta'),row=el('div',undefined,'de-name');row.append(el('strong',s.name),el('span',s.custom?'CUSTOM':'STABLE','de-status'));meta.append(row,el('span',s.type,'de-type'),el('p',`${s.w} × ${s.h} ${s.unit}`,'de-size'));card.append(meta);grid.append(card)});window.lucide?.createIcons()}
function show(s){dialog.replaceChildren();const head=el('header');head.append(el('h2',s.name),button('×',()=>dialog.close(),'de-close'));head.lastChild.setAttribute('aria-label','关闭');const content=el('div',undefined,'de-details');content.append(preview(s),el('p',`${s.type} · ${s.w} × ${s.h} ${s.unit}`));const error=el('p',undefined,'de-error');error.setAttribute('role','alert');const start=button('使用此规格',async()=>{start.disabled=true;try{await window.CanvasWorkspace.start({source:'deliverables',outputSpec:{name:s.name,width:s.w,height:s.h,unit:s.unit,type:s.type}});dialog.close()}catch(e){error.textContent='创建失败：'+e.message;start.disabled=false}},'de-primary');content.append(error,start);dialog.append(head,content);dialog.showModal()}
upload.onchange=async()=>{const file=upload.files[0];upload.value='';if(!file)return;try{if(file.size>1024*1024)throw Error('规格文件请控制在 1 MB 内');const data=JSON.parse(await file.text()),list=Array.isArray(data)?data:[data];if(!list.length||list.length>100||!list.every(valid))throw Error('JSON 需要 name、type、w、h、unit（px/mm）和 groups（分类序号 1–6）字段');const next=[...custom,...list.map(s=>({...s,id:D.id(),custom:true}))];localStorage.setItem('workbench-deliverable-specs',JSON.stringify(next));custom=next;category=0;render()}catch(e){dialog.replaceChildren(el('h2','导入规格'),el('p',e.message),button('关闭',()=>dialog.close()));dialog.showModal()}};
render();
})();
