document.addEventListener('DOMContentLoaded',async()=>{
'use strict';
const host=document.getElementById('onlineWorksheetAssign');if(!host)return;
const notice=document.createElement('p');notice.setAttribute('role','status');notice.textContent='Ładowanie kart pracy…';
const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:12px 0';
const chooser=document.createElement('select');chooser.setAttribute('aria-label','Karta pracy do opublikowania');chooser.style.cssText='max-width:100%;min-width:220px;padding:10px;border-radius:8px';
const submit=document.createElement('button');submit.type='button';submit.className='button';submit.textContent='Przypisz i opublikuj w Supabase';
const create=document.createElement('a');create.href='worksheet-editor.html';create.className='button secondary';create.textContent='+ Utwórz kartę pracy';
row.append(chooser,submit,create);const published=document.createElement('div');host.replaceChildren(notice,row,published);
const show=(text,isError=false)=>{notice.textContent=text;notice.style.color=isError?'#e26b6b':''};
const local=()=>{try{const a=JSON.parse(localStorage.getItem('algoclass-teacher-worksheets-v1')||'[]');return Array.isArray(a)?a:[]}catch{return[]}};
let db,user,classId,className;
try{
 if(!window.AlgoCloud?.configured())throw Error('Brak konfiguracji Supabase.');
 db=await AlgoCloud.connect(); user=await AlgoCloud.session(); const profile=await AlgoCloud.me();
 if(!user||profile?.role!=='teacher')throw Error('Zaloguj się na konto nauczyciela.');
 const param=new URLSearchParams(location.search).get('id');if(!param)throw Error('Brakuje identyfikatora klasy w adresie.');
 let map={};try{map=JSON.parse(localStorage.getItem('algoclass-cloud-classmap-'+user.id)||'{}')}catch{}
 const localId=map[param]||(/^cloud-/.test(param)?param.slice(6):param);
 const candidates=[localId];if(param!==localId)candidates.push(param);
 let found=null;
 for(const candidate of candidates){if(!/^[a-f0-9]{8}-[a-f0-9-]{27,}$/i.test(candidate))continue;
  const result=await db.from('classrooms').select('id,name,join_code').eq('id',candidate).eq('owner_id',user.id).maybeSingle();if(result.error)throw result.error;if(result.data){found=result.data;break}}
 if(!found){let classes=[];try{classes=JSON.parse(localStorage.getItem('algoclass-teacher-classes-v1')||'[]')}catch{}
  const old=classes.find(x=>x.id===param);
  if(old?.code){const result=await db.from('classrooms').select('id,name,join_code').eq('owner_id',user.id).eq('join_code',old.code.toUpperCase()).maybeSingle();if(result.error)throw result.error;found=result.data}}
 if(!found)throw Error('Nie odnaleziono klasy w Supabase. Wróć do „Moje klasy” i kliknij „Pobierz klasy z Supabase”.');
 classId=found.id;className=found.name;
 const sheets=local();chooser.replaceChildren();
 for(const card of sheets){const opt=document.createElement('option');opt.value=String(card.id);opt.textContent=(card.title||'Bez tytułu')+' ('+(card.lang==='python'?'Python':'C++')+')';chooser.append(opt)}
 submit.disabled=!sheets.length;
 if(!sheets.length)show('Nie znaleziono lokalnych kart pracy. Utwórz kartę w kreatorze na tym samym urządzeniu i w tej samej przeglądarce.');
 else show('Klasa „'+className+'”. Projekty kart są zapisane lokalnie. Wybierz projekt i kliknij „Przypisz i opublikuj”, aby pojawił się w Supabase oraz u uczniów.');
 async function list(){const res=await db.from('worksheets').select('id,title,language,updated_at').eq('class_id',classId).order('updated_at',{ascending:false});if(res.error)throw res.error;published.replaceChildren();
 const h=document.createElement('h3');h.textContent='Karty zapisane w Supabase ('+(res.data||[]).length+')';published.append(h);
 if(!res.data?.length){const p=document.createElement('p');p.textContent='Brak opublikowanych kart pracy dla tej klasy.';published.append(p)}
 for(const entry of res.data||[]){const div=document.createElement('div');div.style.cssText='display:flex;gap:12px;align-items:center;padding:10px 0;flex-wrap:wrap;border-top:1px solid var(--border,#43516b)';const name=document.createElement('span');name.textContent=entry.title+' · '+(entry.language==='python'?'Python':'C++');const link=document.createElement('a');link.href='worksheet.html?cloud='+encodeURIComponent(entry.id);link.target='_blank';link.rel='noopener';link.textContent='Otwórz ↗';div.append(name,link);published.append(div)}}
 await list();
 submit.addEventListener('click',async()=>{
  const card=local().find(x=>String(x.id)===chooser.value);if(!card){show('Wybierz kartę pracy.',true);return}
  if(!card.title?.trim()||!Array.isArray(card.tasks)||!card.tasks.length){show('Karta musi mieć tytuł i co najmniej jedno zadanie.',true);return}
  if(!['cpp','python'].includes(card.lang)){show('Nieznany język karty: '+card.lang,true);return}
  submit.disabled=true;show('Zapisywanie karty w Supabase…');
  try{
   const id=user.id+':'+classId+':'+card.id;
   const payload={id,owner_id:user.id,class_id:classId,title:card.title,language:card.lang,content:{...card,classId},updated_at:new Date().toISOString()};
   const result=await db.from('worksheets').upsert(payload,{onConflict:'id'}).select('id').single();
   if(result.error)throw result.error;if(result.data?.id!==id)throw Error('Nie otrzymano potwierdzenia zapisu z Supabase.');
   await list();window.dispatchEvent(new CustomEvent('algoclass:worksheet-published',{detail:{classId}}));show('Zapisano w Supabase: „'+card.title+'”. Karta powinna pojawić się na koncie ucznia należącego do tej klasy.');
  }catch(error){show('Nie udało się opublikować karty: '+(error.message||String(error)),true)}finally{submit.disabled=false}
 });
}catch(error){show('Błąd kart pracy online: '+(error.message||String(error)),true);submit.disabled=true}
});
