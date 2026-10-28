document.addEventListener('DOMContentLoaded',async()=>{'use strict';
  const classBox=document.getElementById('myCloudClasses');
  const joinForm=document.getElementById('joinForm');
  const message=document.getElementById('joinMessage');
  const worksheetPanel=document.getElementById('studentWorksheetList');
  if(!classBox||!joinForm)return;
  const setMessage=(value,error=false)=>{message.textContent=value;message.className='form-message '+(error?'error':'info')};
  const sheetBox=worksheetPanel;
  if(sheetBox)sheetBox.textContent='Ładowanie przypisanych kart z Supabase…';
  const configured=!!window.AlgoCloud&&AlgoCloud.configured();
  if(!configured){classBox.textContent='Nie można pobrać klas: Supabase nie jest skonfigurowane.';joinForm.querySelector('button[type=submit]').disabled=true;return}
  let db,user;
  try{
    db=await AlgoCloud.connect();user=await AlgoCloud.session();
    if(!user){classBox.textContent='Zaloguj się, aby wyświetlić swoje klasy.';joinForm.querySelector('button[type=submit]').disabled=true;return}
    await refresh();
  }catch(error){classBox.textContent='Nie można pobrać klas: '+(error.message||String(error));if(sheetBox)sheetBox.textContent='Nie można pobrać kart: '+(error.message||String(error))}
  async function refresh(){
    const memberships=await db.from('class_memberships').select('class_id').eq('student_id',user.id);
    if(memberships.error)throw memberships.error;
    const ids=(memberships.data||[]).map(item=>item.class_id);
    classBox.replaceChildren();if(sheetBox)sheetBox.replaceChildren();
    if(!ids.length){classBox.textContent='Nie należysz jeszcze do żadnej klasy. Wpisz kod otrzymany od nauczyciela.';if(sheetBox)sheetBox.textContent='Dołącz do klasy, aby zobaczyć przypisane karty pracy.';return}
    const classes=await db.from('classrooms').select('id,name').in('id',ids);
    if(classes.error)throw classes.error;
    for(const item of classes.data||[]){
      const button=document.createElement('button');button.type='button';button.className='class-card';
      const icon=document.createElement('span');icon.className='class-icon';icon.textContent=(item.name||'KL').trim().slice(0,2).toUpperCase();
      const body=document.createElement('span');const title=document.createElement('strong');title.textContent=item.name;
      const subtitle=document.createElement('small');subtitle.textContent='Zadania i materiały klasy';body.append(title,subtitle);
      const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='→';button.append(icon,body,arrow);
      button.onclick=()=>{const nav=document.querySelector('.nav-link[data-view="worksheets"]');if(nav)nav.click();sheetBox.scrollIntoView({behavior:'smooth',block:'start'})};
      classBox.append(button)
    }
    if(!sheetBox)return;
    const response=await db.from('worksheets').select('id,title,language,class_id').in('class_id',ids);
    if(response.error)throw response.error;
    const heading=document.createElement('h3');heading.textContent='Karty pracy przypisane do Twoich klas';sheetBox.append(heading);
    const sheets=response.data||[];
    if(!sheets.length){const p=document.createElement('p');p.textContent='Nauczyciel nie przypisał jeszcze żadnych kart pracy.';sheetBox.append(p);return}
    const states=new Map();const sheetIds=sheets.map(item=>item.id);
    const [drafts,submissions]=await Promise.all([
      db.from('worksheet_progress').select('worksheet_id').eq('student_id',user.id).in('worksheet_id',sheetIds),
      db.from('submissions').select('worksheet_id,percent').eq('student_id',user.id).in('worksheet_id',sheetIds)
    ]);
    if(drafts.error)throw new Error('Nie udało się odczytać postępów (worksheet_progress): '+drafts.error.message);
    if(submissions.error)throw submissions.error;
    for(const item of drafts.data||[])states.set(item.worksheet_id,'W trakcie');
    for(const item of submissions.data||[])states.set(item.worksheet_id,'Oddana · '+item.percent+'%');
    for(const sheet of sheets){
      const div=document.createElement('div');div.className='worksheet-list-row';
      const text=document.createElement('span');text.textContent=sheet.title+' · '+(sheet.language==='python'?'Python':'C++');
      const status=document.createElement('small');status.textContent=states.get(sheet.id)||'Nierozpoczęta';status.style.margin='0 10px';
      const link=document.createElement('a');link.href='worksheet.html?cloud='+encodeURIComponent(sheet.id);link.target='_blank';link.rel='noopener';link.textContent='Otwórz kartę ↗';
      div.append(text,status,link);sheetBox.append(div)
    }
  }
  joinForm.addEventListener('submit',async event=>{
    event.preventDefault();if(!db||!user){setMessage('Zaloguj się, aby dołączyć do klasy.',true);return}
    const code=document.getElementById('classCode').value.trim();if(!code){setMessage('Wpisz kod klasy.',true);return}
    const button=joinForm.querySelector('button[type=submit]');button.disabled=true;setMessage('Sprawdzanie kodu…');
    try{
      const result=await db.rpc('join_class',{p_code:code});if(result.error)throw result.error;
      document.getElementById('classCode').value='';await refresh();setMessage('Dołączono do klasy.');
    }catch(error){setMessage('Nie udało się dołączyć: '+(error.message||String(error)),true)}
    finally{button.disabled=false}
  });
});

