(() => {
  const $=s=>document.querySelector(s),style=document.createElement('link');style.rel='stylesheet';style.href='workbench-prd.css';document.head.append(style);
  const account=$('.account'),contact=$('.top-contact'),topbar=$('.topbar');
  account.querySelectorAll('.menu-row').forEach(n=>{if(n.textContent.trim()==='我的作品')n.remove()});
  account.querySelectorAll('.menu-row:not(a)').forEach(n=>{n.tabIndex=0;n.setAttribute('role','button');n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();n.click()}}});
  const mobile=document.querySelector('.mobile-nav');if(mobile&&!mobile.querySelector('[href="#deliverables"]')){const a=document.createElement('a');a.href='#deliverables';a.textContent='Deliverables';mobile.insertBefore(a,mobile.querySelector('[href="#projects"]'))}
  const old=account.querySelector(':scope > .avatar'),avatar=document.createElement('button');avatar.type='button';avatar.className=old.className;avatar.innerHTML=old.innerHTML;avatar.setAttribute('aria-label','个人中心');avatar.setAttribute('aria-haspopup','true');old.replaceWith(avatar);
  avatar.addEventListener('click',e=>{e.stopPropagation();account.classList.toggle('open');avatar.setAttribute('aria-expanded',String(account.classList.contains('open')))});
  account.addEventListener('keydown',e=>{if(e.key==='Escape'){account.classList.remove('open');avatar.blur()}});
  const desktop=new URLSearchParams(location.search).get('client')==='desktop';document.body.classList.toggle('desktop-client',desktop);
  const desktopArea=document.createElement('div');desktopArea.className='desktop-account-area';if(desktop)$('.sidebar').append(desktopArea);
  function placeAccount(){if(desktop){desktopArea.append(contact,account);return}if(location.hash==='#canvas')$('.cw-head')?.append(account);else topbar.append(contact,account)}
  placeAccount();addEventListener('hashchange',placeAccount);
  const qr=contact.querySelector('.qr-code');qr.textContent='社群二维码待配置';qr.setAttribute('aria-label','尚未配置社群二维码');contact.querySelector('strong').textContent='微信社群';contact.querySelector('small').textContent='请由运营提供有效二维码';
  $('.side-note')?.remove();
  // Preserve desktop preview when opening local editors or embedded Assets.
  if(desktop)document.querySelectorAll('iframe').forEach(frame=>{const u=new URL(frame.src,location.href);u.searchParams.set('client','desktop');frame.src=u.href});
})();
