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
    const classes=await AlgoData.studentClasses(db,user.id);
    const ids=classes.map(x=>x.id);
    classBox.replaceChildren();if(sheetBox)sheetBox.replaceChildren();
    if(!ids.length){classBox.textContent='Nie należysz jeszcze do żadnej klasy. Wpisz kod otrzymany od nauczyciela.';if(sheetBox)sheetBox.textContent='Dołącz do klasy, aby zobaczyć przypisane karty pracy.';return}
    for(const item of classes){
      const button=document.createElement('button');button.type='button';button.className='class-card';
      const icon=document.createElement('span');icon.className='class-icon';icon.textContent=(item.name||'KL').trim().slice(0,2).toUpperCase();
      const body=document.createElement('span');const title=document.createElement('strong');title.textContent=item.name;
      const subtitle=document.createElement('small');subtitle.textContent='Zadania i materiały klasy';body.append(title,subtitle);
      const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='→';button.append(icon,body,arrow);
      button.onclick=()=>{const nav=document.querySelector('.nav-link[data-view="worksheets"]');if(nav)nav.click();sheetBox?.scrollIntoView({behavior:'smooth',block:'start'})};
      classBox.append(button)
    }
    if(!sheetBox)return;
    let sheets;
    try { sheets=await AlgoData.studentWorksheets(db,user.id,ids); }
    catch(error){sheetBox.textContent="Nie można pobrać kart pracy: "+(error.message||String(error));return;}
    const heading=document.createElement('h3');heading.textContent='Karty pracy przypisane do Twoich klas';sheetBox.append(heading);
    if(!sheets.length){const p=document.createElement('p');p.textContent='Nauczyciel nie przypisał jeszcze żadnych kart pracy.';sheetBox.append(p);return}
    for(const sheet of sheets){
      const div=document.createElement('div');div.className='worksheet-list-row';
      const text=document.createElement('span');text.textContent=sheet.title+' · '+(sheet.language==='python'?'Python':'C++');
      const status=document.createElement('small');status.textContent=sheet.status;status.style.margin='0 10px';
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

