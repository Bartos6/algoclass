(()=>{'use strict';
// Jeden wspólny szablon nawigacji i nagłówka AlgoClass.
const body=document.body,role=body.dataset.algoclassRole,page=body.dataset.algoclassPage;
const side=document.querySelector('[data-algoclass-sidebar]'),top=document.querySelector('[data-algoclass-topbar]');
if(!side||!top)return;
const teacher=role==='teacher',main=page==='teacher',student=role==='student';
const teacherNav=[['dashboard','▦','Dashboard','teacher.html#dashboard'],['classes','▤','Moje klasy','teacher.html#classes'],['library','▣','Biblioteka zadań','teacher.html#library'],['worksheets','▤','Karty pracy','worksheet-builder.html'],['stats','◫','Statystyki','teacher.html#stats']];
const studentNav=[['classes','Moje klasy'],['tasks','Zadania'],['worksheets','Karty pracy'],['results','Moje wyniki']];
if(teacher){
 const nav=teacherNav.map(([id,icon,label,href])=>main&&id!=='worksheets'?`<button class="nav${id==='dashboard'?' active':''}" data-view="${id}">${icon} <span>${label}</span></button>`:`<a class="nav${((page==='worksheet-builder'||page==='worksheet-editor')&&id==='worksheets')||(page==='class-detail'&&id==='classes')?' active':''}" href="${href}">${icon} <span>${label}</span></a>`).join('');
 side.innerHTML=`<a class="brand" href="teacher.html#dashboard">Algo<span>Class</span></a><p class="side-caption">PANEL NAUCZYCIELA</p><nav aria-label="Nawigacja nauczyciela">${nav}</nav><div class="sidebar-bottom"><button class="theme-btn" id="themeBtn" type="button">◐ Zmień motyw</button><a href="student.html">Zobacz panel ucznia ↗</a></div>`;
 let title=page==='class-detail'?'Szczegóły klasy':page==='worksheet-builder'?'Karty pracy':'Edytor karty pracy';
 top.innerHTML=`<div><div class="eyebrow">ALGOCLASS / NAUCZYCIEL</div><h1${main?' id="pageTitle"':''}>${main?'Dashboard':title}</h1></div><a class="user" href="teacher.html#profile" aria-label="Otwórz mój profil" title="Otwórz profil" style="text-decoration:none;color:inherit"><span class="avatar" id="accountAvatar">…</span><span id="accountTopName">Ładowanie konta…</span></a>`;
 if(!main){
  const btn=document.getElementById('themeBtn');
  // Podstrony nie korzystają z obsługi themeBtn w teacher.js.
  btn.addEventListener('click',()=>{body.classList.toggle('dark');try{localStorage.setItem('algoclass-theme',body.classList.contains('dark')?'dark':'light')}catch{}});
  try{body.classList.toggle('dark',localStorage.getItem('algoclass-theme')==='dark')}catch{}
 }
}else if(student){
 side.innerHTML=`<nav aria-label="Nawigacja ucznia">${studentNav.map(([id,label],i)=>`<button class="nav-link${i===0?' active':''}" data-view="${id}" type="button">${label}</button>`).join('')}</nav><a class="logout-link" href="index.html">Wyloguj</a>`;
 top.innerHTML=`<a class="app-brand" href="student.html">AlgoClass</a><div class="topbar-actions"><button type="button" id="openStudentProfile" class="demo-user" title="Otwórz profil" aria-label="Otwórz mój profil" style="cursor:pointer;border:0;background:transparent;color:inherit;font:inherit;padding:7px 10px;border-radius:8px;text-decoration:underline;text-underline-offset:3px"><span id="accountTopName">Ładowanie konta…</span></button><button class="theme-toggle app-theme-toggle" data-theme-toggle type="button" aria-label="Zmień motyw">🌙</button></div>`;
 document.getElementById('openStudentProfile').addEventListener('click',()=>{
  const link=[...document.querySelectorAll('[data-view]')].find(x=>x.dataset.view==='profile');
  if(link)link.click();else{const view=document.getElementById('view-profile');if(view){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));view.classList.add('active')}}
 });
}
// Na podstronach nie ma profile-online.js. Nagłówek i tak ma pokazywać zalogowaną osobę.
if(teacher&&!main){
 const update=async()=>{try{if(!window.AlgoCloud?.configured())return;const me=await AlgoCloud.me();if(!me)return;const name=(me.display_name||'').trim()||me.email||'Moje konto';const el=document.getElementById('accountTopName'),av=document.getElementById('accountAvatar');if(el)el.textContent=name;if(av){const parts=name.split(/\s+/);av.textContent=(parts.length>1?parts[0][0]+parts[parts.length-1][0]:name.slice(0,2)).toUpperCase()}}catch(err){console.warn('AlgoClass: nie udało się pobrać nazwy konta',err)}};
 window.addEventListener('load',update,{once:true});
}
})();