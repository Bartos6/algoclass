document.addEventListener('DOMContentLoaded',async()=>{'use strict';
 const host=document.getElementById('teacherClassStudents');if(!host)return;
 const status=document.createElement('p');status.className='muted';status.setAttribute('role','status');status.textContent='Ładowanie uczniów…';
 host.replaceChildren(status);
 try{
  if(!window.AlgoCloud?.configured())throw Error('Supabase nie jest skonfigurowane.');
  const db=await AlgoCloud.connect(),me=await AlgoCloud.me();
  if(me?.role!=='teacher')throw Error('Zaloguj się jako nauczyciel.');
  const localId=new URLSearchParams(location.search).get('id');
  let map={};try{map=JSON.parse(localStorage.getItem('algoclass-cloud-classmap-'+me.id)||'{}')}catch{}
  const classId=map[localId]||(localId&&/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(localId)?localId:null);
  if(!classId)throw Error('Nie znaleziono identyfikatora klasy online. Otwórz klasę z panelu „Moje klasy”.');
  const own=await db.from('classrooms').select('id').eq('id',classId).eq('owner_id',me.id).maybeSingle();
  if(own.error)throw own.error;if(!own.data)throw Error('Nie masz dostępu do tej klasy.');
  const members=await db.from('class_memberships').select('student_id,joined_at').eq('class_id',classId).order('joined_at',{ascending:true});
  if(members.error)throw members.error;
  const list=members.data||[];if(!list.length){status.textContent='Żaden uczeń nie dołączył jeszcze do tej klasy.';return}
  const result=await db.from('profiles').select('id,first_name,last_name,display_name').in('id',list.map(x=>x.student_id));
  if(result.error)throw result.error;
  const names=new Map((result.data||[]).map(p=>[p.id,p]));
  status.textContent='Liczba uczniów: '+list.length;
  const table=document.createElement('table');table.style.width='100%';
  const head=document.createElement('thead');head.innerHTML='<tr><th style="text-align:left">Imię i nazwisko</th><th style="text-align:left">Data dołączenia</th></tr>';table.append(head);
  const body=document.createElement('tbody');
  for(const m of list){const p=names.get(m.student_id),tr=document.createElement('tr');
   const name=document.createElement('td');name.style.padding='10px 8px';name.textContent=[p?.first_name,p?.last_name].filter(Boolean).join(' ').trim()||p?.display_name||'Nie uzupełniono imienia i nazwiska';
   const date=document.createElement('td');date.style.padding='10px 8px';date.textContent=m.joined_at?new Date(m.joined_at).toLocaleDateString('pl-PL'):'—';
   tr.append(name,date);body.append(tr);
  }
  table.append(body);host.append(table);
 }catch(e){status.textContent='Nie można pobrać uczniów: '+(e?.message||'Nieznany błąd')}
});
