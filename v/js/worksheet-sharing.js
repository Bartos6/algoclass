document.addEventListener('DOMContentLoaded',async()=>{
  'use strict';
  const root=document.getElementById('communitySheets');
  if(!root)return;
  root.textContent='Ładowanie publicznych kart…';
  try{
    const {db,user}=await AlgoData.context('teacher');
    const {data,error}=await db.from('worksheet_templates')
      .select('id,title,language,visibility,owner_id')
      .eq('visibility','public').neq('owner_id',user.id)
      .order('updated_at',{ascending:false});
    if(error)throw error;
    root.replaceChildren();
    if(!data?.length){root.textContent='Nie ma jeszcze publicznych kart innych nauczycieli.';return}
    for(const item of data){
      const card=document.createElement('div');card.className='builder-sheet';
      const label=document.createElement('span');
      label.textContent=item.title+' · '+(item.language==='python'?'Python':'C++')+' · Publiczna';
      card.append(label);root.append(card)
    }
  }catch(e){root.textContent='Nie można pobrać kart publicznych: '+(e.message||String(e))}
});
