document.addEventListener('DOMContentLoaded',async()=>{
 'use strict';
 const host=document.getElementById('onlineWorksheetAssign');if(!host)return;
 const info=document.createElement('p');info.setAttribute('role','status');info.textContent='Ładowanie kart pracy…';
 const chooser=document.createElement('select');chooser.setAttribute('aria-label','Wybierz kartę pracy');chooser.style.cssText='max-width:100%;padding:10px;margin:8px 10px 8px 0';
 const add=document.createElement('button');add.type='button';add.textContent='Przypisz i opublikuj kartę';add.className='button';
 const link=document.createElement('a');link.href='worksheet-editor.html';link.textContent=' + Nowa karta pracy';link.style.marginLeft='12px';
 const list=document.createElement('div');list.style.marginTop='16px';
 host.append(info,chooser,add,link,list);
 const local=()=>{try{const d=JSON.parse(localStorage.getItem('algoclass-teacher-worksheets-v1'));return Array.isArray(d)?d:[]}catch{return[]}};
 let db,user,classId;
 function say(t,error=false){info.textContent=t;info.style.color=error?'#d65b5b':''}
 try{
  if(!window.AlgoCloud?.configured())throw Error('Supabase nie jest skonfigurowane.');
  db=await AlgoCloud.connect();user=await AlgoCloud.session();const profile=await AlgoCloud.me();
  if(!user||profile?.role!=='teacher')throw Error('Zaloguj się jako nauczyciel.');
  const param=new URLSearchParams(location.search).get('id');
  let mapping={};try{mapping=JSON.parse(localStorage.getItem('algoclass-cloud-classmap-'+user.id))||{}}catch{}
  classId=mapping[param]||param;
  const own=await db.from('classrooms').select('id,name').eq('id',classId).eq('owner_id',user.id).maybeSingle();
  if(own.error)throw own.error;if(!own.data)throw Error('Nie znaleziono klasy w Supabase lub nie masz do niej dostępu.');
  function populate(){chooser.replaceChildren();const cards=local();for(const s of cards){const opt=document.createElement('option');opt.value=s.id;opt.textContent=s.title+' · '+(s.lang==='python'?'Python':'C++');chooser.append(opt)}add.disabled=!cards.length;if(!cards.length)say('Utwórz pierwszą kartę w kreatorze nauczyciela.');return cards}
  async function refresh(){
   const result=await db.from('worksheets').select('id,title,language,updated_at').eq('class_id',classId).order('updated_at',{ascending:false});
   if(result.error)throw result.error;list.replaceChildren();
   if(!result.data?.length){const p=document.createElement('p');p.textContent='Brak opublikowanych kart w tej klasie.';list.append(p);return}
   for(const item of result.data){const row=document.createElement('div');row.style.cssText='display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--border,#43516b)';
    const label=document.createElement('strong');label.textContent=item.title+' · '+(item.language==='python'?'Python':'C++');
    const preview=document.createElement('a');preview.href='worksheet.html?cloud='+encodeURIComponent(item.id);preview.target='_blank';preview.rel='noopener';preview.textContent='Podgląd ↗';
    row.append(label,preview);list.append(row)
   }
  }
  populate();await refresh();say('Klasa: '+own.data.name+'. Karty zapisują się w Supabase.');
  add.onclick=async()=>{const sheet=local().find(x=>x.id===chooser.value);if(!sheet)return;say('Publikowanie karty…');add.disabled=true;
   try{
    if(!Array.isArray(sheet.tasks)||!sheet.tasks.length)throw Error('Karta nie ma zadań.');
    const id=user.id+':'+classId+':'+sheet.id;
    const payload={id,owner_id:user.id,class_id:classId,title:sheet.title,language:sheet.lang,content:{...sheet,classId},updated_at:new Date().toISOString()};
    const res=await db.from('worksheets').upsert(payload,{onConflict:'id'});if(res.error)throw res.error;
    await refresh();say('Opublikowano kartę „'+sheet.title+'”. Uczniowie klasy zobaczą ją po odświeżeniu panelu.');
   }catch(e){say('Błąd publikowania: '+(e.message||String(e)),true)}finally{add.disabled=false}
  };
 }catch(e){say('Nie można obsłużyć kart online: '+(e.message||String(e)),true);add.disabled=true}
});
