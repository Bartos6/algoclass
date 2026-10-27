(()=>{'use strict';
const $=id=>document.getElementById(id);
const teacher=!!document.querySelector('.side-caption');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roleLabel=role=>role==='teacher'?'Nauczyciel':role==='student'?'Uczeń':'Nieustalona';
const initials=s=>{const parts=String(s||'').trim().split(/\s+/).filter(Boolean);return (parts.length>1?parts[0][0]+parts[parts.length-1][0]:(parts[0]||'?').slice(0,2)).toUpperCase()};
let details=null,fail=null;
function draw(){
 const top=$('accountTopName'), avatar=$('accountAvatar');
 const name=details?.name||'Nie udało się wczytać profilu';
 if(top)top.textContent=name;
 if(avatar)avatar.textContent=details?initials(details.name):'?';
 if(!teacher){
  if($('accountName'))$('accountName').textContent=name;
  if($('accountEmail'))$('accountEmail').textContent=details?.email||'';
  if($('accountRole'))$('accountRole').textContent=roleLabel(details?.role);
  if($('accountStatus'))$('accountStatus').textContent=fail||'';
  return;
 }
 const view=$('view');if(!view||!location.hash.startsWith('#profile'))return;
 // Widok jest dynamicznie tworzony przez teacher.js: zastępujemy wyłącznie jego część profilową.
 const box=view.querySelector('.card');if(!box||box.dataset.accountLoaded==='true')return;
 box.dataset.accountLoaded='true';
 const heading=box.querySelector('h2');if(heading)heading.textContent='Moje konto';
 const rows=box.querySelectorAll('.list-row');
 for(const row of rows){const key=row.querySelector('.muted')?.textContent.trim();if(key==='Rola'){
  const strong=row.querySelector('strong');if(strong)strong.textContent=details?roleLabel(details.role):'—';
 }else if(key==='Konto'){
  const strong=row.querySelector('strong');if(strong)strong.textContent=details?.email||'—';
 }}
 const nameRow=document.createElement('div');nameRow.className='list-row';
 const label=document.createElement('span');label.className='muted';label.textContent='Nazwa konta';
 const value=document.createElement('strong');value.textContent=details?.name||'—';
 nameRow.append(label,value);
 const first=box.querySelector('.list-row');if(first)box.insertBefore(nameRow,first);else box.append(nameRow);
 const description=view.querySelector('.lead');if(description)description.textContent=fail||'Dane aktualnie zalogowanego użytkownika.';
 const demo=view.querySelector('.demo-banner');if(demo&&demo.textContent.includes('demonstr'))demo.remove();
}
async function refresh(){try{
 if(!window.AlgoCloud?.configured())throw Error('Supabase nie jest skonfigurowane.');
 const user=await AlgoCloud.session();if(!user)throw Error('Nie jesteś zalogowany. Zaloguj się ponownie.');
 const db=await AlgoCloud.connect();
 const {data,error}=await db.from('profiles').select('display_name,role').eq('id',user.id).maybeSingle();
 if(error)throw error;
 // Nazwa jest brana z profiles, a gdy jej brakuje, z adresu konta; bez sztucznych danych.
 const name=String(data?.display_name||'').trim()||user.email||'Użytkownik';
 details={name,email:user.email||'',role:data?.role||null};fail=null;
 }catch(err){details=null;fail='Nie można pobrać profilu: '+(err?.message||'Nieznany błąd');}
 draw();
}
document.addEventListener('DOMContentLoaded',()=>{
 if(teacher){const host=$('view');if(host){const observer=new MutationObserver(()=>{if(location.hash.startsWith('#profile'))draw()});observer.observe(host,{childList:true});}window.addEventListener('hashchange',()=>queueMicrotask(draw));}
 refresh();
});
})();