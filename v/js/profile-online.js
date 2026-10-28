(()=>{'use strict';
const $=id=>document.getElementById(id);
const teacher=!!document.querySelector('.side-caption');
const roleLabel=r=>r==='teacher'?'Nauczyciel':r==='student'?'Uczeń':'Nieustalona';
const initials=s=>{const p=String(s||'').trim().split(/\s+/).filter(Boolean);return (p.length>1?p[0][0]+p[p.length-1][0]:(p[0]||'?').slice(0,2)).toUpperCase()};
let details=null,fail=null;
function editForm(){
 const form=document.createElement('form');form.id='profileNamesForm';form.style.marginTop='20px';form.style.maxWidth='470px';
 const heading=document.createElement('h3');heading.textContent='Imię i nazwisko';form.append(heading);
 for(const [key,title,max] of [['first_name','Imię',80],['last_name','Nazwisko',100]]){
  const label=document.createElement('label');label.textContent=title;label.style.display='block';label.style.margin='12px 0';
  const input=document.createElement('input');input.name=key;input.required=true;input.maxLength=max;input.autocomplete=key==='first_name'?'given-name':'family-name';input.value=details?.[key]||'';input.style.display='block';input.style.width='100%';input.style.padding='10px';input.style.marginTop='5px';
  label.append(input);form.append(label);
 }
 const button=document.createElement('button');button.type='submit';button.textContent='Zapisz imię i nazwisko';button.className=teacher?'button':'primary-button';form.append(button);
 const info=document.createElement('p');info.setAttribute('role','status');info.setAttribute('aria-live','polite');info.className='muted';form.append(info);
 form.onsubmit=async e=>{e.preventDefault();const first_name=form.elements.first_name.value.trim(),last_name=form.elements.last_name.value.trim();
  if(!first_name||!last_name){info.textContent='Wpisz imię i nazwisko.';return}
  button.disabled=true;info.textContent='Zapisywanie…';
  try{const db=await AlgoCloud.connect(),user=await AlgoCloud.session();if(!user)throw Error('Sesja wygasła. Zaloguj się ponownie.');
   const {error}=await db.from('profiles').update({first_name,last_name}).eq('id',user.id);if(error)throw error;
   info.textContent='Zapisano dane profilu.';await refresh();closeEditor(form.parentElement);
  }catch(err){info.textContent='Nie udało się zapisać: '+(err?.message||'Nieznany błąd')}
  finally{button.disabled=false}
 };
 return form;
}
function closeEditor(host){if(!host)return;const form=host.querySelector('#profileNamesForm');if(form)form.remove();const btn=host.querySelector('#profileEditButton');if(btn){btn.hidden=false;btn.focus()}}
function showEditor(host){
 if(!host)return;
 let btn=host.querySelector('#profileEditButton');
 if(!btn){
  btn=document.createElement('button');btn.type='button';btn.id='profileEditButton';btn.className=teacher?'button':'primary-button';btn.textContent='Edytuj';
  btn.style.marginTop='12px';
  btn.addEventListener('click',()=>{if(!details)return;btn.hidden=true;host.append(editForm());const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Anuluj';cancel.className=teacher?'button':'secondary-button';cancel.style.marginLeft='10px';cancel.addEventListener('click',()=>closeEditor(host));host.querySelector('#profileNamesForm').append(cancel);host.querySelector('#profileNamesForm input')?.focus()});
  host.append(btn);
 }
 btn.disabled=!details;
}
function draw(){
 const name=details?.name||'Nie udało się wczytać profilu';
 if($('accountTopName'))$('accountTopName').textContent=name;
 if($('accountAvatar'))$('accountAvatar').textContent=details?initials(name):'?';
 if(!teacher){
  if($('accountName'))$('accountName').textContent=name;
  if($('accountEmail'))$('accountEmail').textContent=details?.email||'';
  if($('accountRole'))$('accountRole').textContent=roleLabel(details?.role);
  if($('accountStatus'))$('accountStatus').textContent=fail||'';
  showEditor($('profileNameEditor'));return;
 }
 const view=$('view');if(!view||!location.hash.startsWith('#profile'))return;
 const card=view.querySelector('.card');if(!card)return;
 if(card.dataset.accountLoaded!=='true'){
  card.dataset.accountLoaded='true';
  const heading=card.querySelector('h2');if(heading)heading.textContent='Moje konto';
  const nameRow=document.createElement('div');nameRow.className='list-row';nameRow.id='accountProfileNameRow';
  const label=document.createElement('span');label.className='muted';label.textContent='Imię i nazwisko';
  const value=document.createElement('strong');nameRow.append(label,value);
  const first=card.querySelector('.list-row');if(first)card.insertBefore(nameRow,first);else card.append(nameRow);
  const demo=view.querySelector('.demo-banner');if(demo&&demo.textContent.includes('demonstr'))demo.remove();
 }
 const strong=$('accountProfileNameRow')?.querySelector('strong');if(strong)strong.textContent=details?.name||'—';
 for(const row of card.querySelectorAll('.list-row')){
  const key=row.querySelector('.muted')?.textContent.trim();
  if(key==='Rola'){const val=row.querySelector('strong');if(val)val.textContent=details?roleLabel(details.role):'—'}
  if(key==='Konto'){const val=row.querySelector('strong');if(val)val.textContent=details?.email||'—'}
 }
 const description=view.querySelector('.lead');if(description)description.textContent=fail||'Dane aktualnie zalogowanego użytkownika.';
 showEditor(card);
}
async function refresh(){try{
 if(!window.AlgoCloud?.configured())throw Error('Supabase nie jest skonfigurowane.');
 const user=await AlgoCloud.session();if(!user)throw Error('Zaloguj się ponownie.');
 const db=await AlgoCloud.connect();
 const {data,error}=await db.from('profiles').select('first_name,last_name,display_name,role').eq('id',user.id).maybeSingle();
 if(error)throw error;
 const first_name=data?.first_name||'',last_name=data?.last_name||'';
 const name=[first_name,last_name].filter(Boolean).join(' ').trim()||String(data?.display_name||'').trim()||user.email||'Użytkownik';
 details={name,email:user.email||'',role:data?.role||null,first_name,last_name};fail=null;
 }catch(err){details=null;fail='Nie można pobrać profilu: '+(err?.message||'Nieznany błąd')}
 draw();
}
document.addEventListener('DOMContentLoaded',()=>{
 if(teacher){const host=$('view');if(host){const obs=new MutationObserver(()=>{if(location.hash.startsWith('#profile'))draw()});obs.observe(host,{childList:true});}
 window.addEventListener('hashchange',()=>queueMicrotask(draw));}
 refresh();
});
})();
