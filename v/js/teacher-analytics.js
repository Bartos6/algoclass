
(()=>{'use strict';
  const host=document.getElementById('view');
  if(!host) return;
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateText=d=>d?new Date(d).toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
  const percent=(n,d)=>d?Math.round(100*n/d):null;
  const pctText=n=>n===null?'—':`${n}%`;
  const pill=n=>`<span class="pill">${escapeHtml(n)}</span>`;
  const notification=e=>`<div class="notice" role="alert">${escapeHtml(e)}</div>`;
  const empty=txt=>`<div class="card" style="padding:20px"><p class="muted">${escapeHtml(txt)}</p></div>`;
  const pages=new Set(['dashboard','stats']);
  let sequence=0;

  async function readAll(db,table,cols,filter){
    let items=[];
    for(let from=0;from<100000;from+=1000){
      let q=db.from(table).select(cols).range(from,from+999);
      if(filter)q=filter(q);
      const {data,error}=await q;
      if(error)throw Error(`${table}: ${error.message}`);
      items.push(...(data||[]));
      if(!data||data.length<1000)break;
    }
    return items;
  }
  async function readForIds(db,table,cols,column,ids){
    let out=[];
    for(let i=0;i<ids.length;i+=60)out.push(...await readAll(db,table,cols,q=>q.in(column,ids.slice(i,i+60))));
    return out;
  }
  async function load(){
    if(!window.AlgoCloud?.configured())throw Error('Supabase nie jest skonfigurowane. Sprawdź js/supabase-config.js.');
    const db=await AlgoCloud.connect();
    const user=await AlgoCloud.session();
    if(!user)throw Error('Sesja wygasła. Zaloguj się ponownie.');
    const profile=await AlgoCloud.me();
    if(profile?.role!=='teacher')throw Error('Statystyki są dostępne tylko dla konta nauczyciela.');
    const classes=await readAll(db,'classrooms','id,name,join_code,owner_id',q=>q.eq('owner_id',user.id));
    classes.sort((a,b)=>a.name.localeCompare(b.name,'pl'));
    const classIds=classes.map(c=>c.id);
    const [members,assignments]=await Promise.all([
      readForIds(db,'class_memberships','class_id,student_id,joined_at','class_id',classIds),
      readForIds(db,'class_worksheets','id,class_id,worksheet_id,assigned_at','class_id',classIds)
    ]);
    const assignmentIds=assignments.map(a=>a.id);
    const progress=await readForIds(db,'worksheet_progress','assignment_id,student_id,status,points,max_points,percent,updated_at,submitted_at','assignment_id',assignmentIds);
    const sheetIds=[...new Set(assignments.map(a=>a.worksheet_id))];
    const sheets=await readForIds(db,'worksheet_templates','id,title,language,topic','id',sheetIds);
    let names=[];
    const studentIds=[...new Set(members.map(m=>m.student_id))];
    if(studentIds.length){
      try{names=await readForIds(db,'profiles','id,display_name,first_name,last_name','id',studentIds)}
      catch(e){console.warn('AlgoClass: profile uczniów nie zostały udostępnione przez RLS.',e)}
    }
    return {classes,members,assignments,progress,sheets,students:new Map(names.map(n=>[n.id, [n.first_name,n.last_name].filter(Boolean).join(' ').trim()||n.display_name||'Uczeń']))};
  }

  const card=(title,value,detail)=>`<div class="card"><div class="metric-label">${escapeHtml(title)}</div><div class="metric-number">${escapeHtml(value)}</div><div class="metric-foot">${escapeHtml(detail)}</div></div>`;
  function renderDashboard(x){
    const submitted=x.progress.filter(p=>p.status==='submitted');
    const students=new Set(x.members.map(m=>m.student_id));
    const recent=x.progress.slice().sort((a,b)=>new Date(b.submitted_at||b.updated_at||0)-new Date(a.submitted_at||a.updated_at||0)).slice(0,6);
    const assignMap=new Map(x.assignments.map(a=>[a.id,a]));
    const names=new Map(x.classes.map(c=>[c.id,c.name]));
    const sheets=new Map(x.sheets.map(s=>[s.id,s.title]));
    const rows=x.classes.map(c=>{
      const members=x.members.filter(m=>m.class_id===c.id);
      const assigns=x.assignments.filter(a=>a.class_id===c.id);
      const ids=new Set(assigns.map(a=>a.id));
      const sent=x.progress.filter(p=>p.status==='submitted'&&ids.has(p.assignment_id));
      return `<tr><td><a href="class-detail.html?id=${encodeURIComponent(c.id)}"><strong>${escapeHtml(c.name)}</strong></a></td><td>${members.length}</td><td>${assigns.length}</td><td>${sent.length}</td></tr>`;
    }).join('');
    const activity=recent.map(p=>{
      const assign=assignMap.get(p.assignment_id);
      const className=names.get(assign?.class_id)||'Klasa';
      const title=sheets.get(assign?.worksheet_id)||'Karta pracy';
      const name=x.students.get(p.student_id)||'Uczeń';
      const status=p.status==='submitted'?'Oddana':'W trakcie';
      return `<div class="list-row"><div><strong>${escapeHtml(name)}</strong> · ${escapeHtml(title)}<div class="muted">${escapeHtml(className)} · ${status}</div></div><small class="muted">${dateText(p.submitted_at||p.updated_at)}</small></div>`;
    }).join('');
    host.innerHTML=`<p class="lead">Aktualny przegląd Twoich klas i kart pracy z Supabase.</p>
      <div class="metrics">${card('Moje klasy',x.classes.length,'Klasy prowadzone przez Ciebie')}${card('Uczniowie',students.size,'Unikalni uczniowie Twoich klas')}${card('Przypisane KP',x.assignments.length,'Przypisania kart do klas')}${card('Oddane prace',submitted.length,'Przesłane karty pracy')}</div>
      <div class="two-cols"><section><div class="section-head"><h2>Twoje klasy</h2><button class="button secondary" id="acShowClasses" type="button">Zobacz klasy →</button></div>
      ${x.classes.length?`<div class="table-wrap"><table><thead><tr><th>Klasa</th><th>Uczniowie</th><th>KP</th><th>Oddane</th></tr></thead><tbody>${rows}</tbody></table></div>`:empty('Nie utworzono jeszcze żadnej klasy.')}</section>
      <section><div class="section-head"><h2>Ostatnia aktywność</h2><button class="button secondary" id="acRefreshDashboard" type="button">Odśwież</button></div><div class="card">${activity||'<p class="muted">Brak zapisanych aktywności kart pracy.</p>'}</div></section></div>`;
    document.getElementById('acShowClasses')?.addEventListener('click',()=>document.querySelector('.sidebar [data-view="classes"]')?.click());
    document.getElementById('acRefreshDashboard')?.addEventListener('click',()=>mount('dashboard'));
  }
  function renderStats(x){
    const allSubmitted=x.progress.filter(p=>p.status==='submitted');
    const avg=allSubmitted.length?Math.round(allSubmitted.reduce((s,p)=>s+Number(p.percent||0),0)/allSubmitted.length):null;
    const totalPossible=x.assignments.reduce((sum,a)=>sum+x.members.filter(m=>m.class_id===a.class_id).length,0);
    const countSubmitted=allSubmitted.length;
    const classBlocks=x.classes.map(c=>{
      const mem=x.members.filter(m=>m.class_id===c.id);
      const ass=x.assignments.filter(a=>a.class_id===c.id);
      const assignmentIds=new Set(ass.map(a=>a.id));
      const all=x.progress.filter(p=>assignmentIds.has(p.assignment_id));
      const submitted=all.filter(p=>p.status==='submitted');
      const average=submitted.length?Math.round(submitted.reduce((s,p)=>s+Number(p.percent||0),0)/submitted.length):null;
      const possibility=ass.length*mem.length;
      const rate=percent(submitted.length,possibility);
      return `<div class="card"><div class="class-title"><a href="class-detail.html?id=${encodeURIComponent(c.id)}">${escapeHtml(c.name)}</a></div><div class="class-meta">${mem.length} uczniów · ${ass.length} przypisanych kart</div><div class="metric-number">${pctText(rate)}</div><div class="muted">Odsetek oddanych prac</div><div class="progress"><span style="width:${rate||0}%"></span></div><p class="muted">Oddane: ${submitted.length}/${possibility} · W trakcie: ${all.filter(p=>p.status==='in_progress').length} · Średni wynik: ${pctText(average)}</p></div>`;
    }).join('');
    const sheets=new Map(x.sheets.map(s=>[s.id,s]));
    const classes=new Map(x.classes.map(c=>[c.id,c.name]));
    const lines=x.assignments.map(a=>{
      const rows=x.progress.filter(p=>p.assignment_id===a.id);
      const done=rows.filter(p=>p.status==='submitted');
      const avgScore=done.length?Math.round(done.reduce((s,p)=>s+Number(p.percent||0),0)/done.length):null;
      const sheet=sheets.get(a.worksheet_id);
      return `<tr><td>${escapeHtml(sheet?.title||'Karta pracy')}</td><td>${escapeHtml(classes.get(a.class_id)||'Klasa')}</td><td>${rows.filter(p=>p.status==='in_progress').length}</td><td>${done.length}</td><td>${pctText(avgScore)}</td></tr>`;
    }).join('');
    host.innerHTML=`<p class="lead">Statystyki kart pracy na podstawie rzeczywistych zapisów z Supabase.</p>
      <div class="metrics">${card('Klasy',x.classes.length,'Twoje klasy')}${card('Przypisania KP',x.assignments.length,'Karty przypisane klasom')}${card('Oddane prace',countSubmitted,'Zapisane przez uczniów')}${card('Średni wynik',pctText(avg),'Tylko oddane prace')}</div>
      <div class="section-head"><h2>Wyniki poszczególnych klas</h2><button class="button secondary" id="acRefreshStats" type="button">Odśwież</button></div>
      ${x.classes.length?`<div class="grid-classes">${classBlocks}</div>`:empty('Nie masz jeszcze żadnej klasy.')}
      <div class="section-head"><h2>Wyniki według kart pracy</h2></div>
      ${x.assignments.length?`<div class="table-wrap"><table><thead><tr><th>Karta pracy</th><th>Klasa</th><th>W trakcie</th><th>Oddane</th><th>Średni wynik</th></tr></thead><tbody>${lines}</tbody></table></div>`:empty('Nie przypisano jeszcze kart pracy do klas.')}
      <p class="muted">Wskaźnik oddanych prac jest obliczany jako liczba oddanych kart w stosunku do liczby uczniów × liczby kart przypisanych do klas. Bez oddanych prac średni wynik wynosi „—”.</p>`;
    document.getElementById('acRefreshStats')?.addEventListener('click',()=>mount('stats'));
  }
  async function mount(page){
    if(!pages.has(page))return;
    const run=++sequence;
    host.innerHTML='<p class="lead">Pobieranie aktualnych danych z Supabase…</p>';
    try{
      const data=await load();
      if(run!==sequence||(location.hash.slice(1)||'dashboard')!==page)return;
      if(page==='dashboard')renderDashboard(data);else renderStats(data);
    }catch(error){
      if(run!==sequence||(location.hash.slice(1)||'dashboard')!==page)return;
      host.innerHTML=`<p class="lead">Dane nauczyciela</p>${notification('Nie można pobrać danych: '+(error?.message||String(error)))}<button class="button secondary" id="acRetryAnalytics">Spróbuj ponownie</button>`;
      document.getElementById('acRetryAnalytics')?.addEventListener('click',()=>mount(page));
    }
  }
  function current(){return location.hash.slice(1)||'dashboard'}
  document.addEventListener('click',e=>{
    const nav=e.target.closest('.sidebar .nav[data-view]');
    if(nav){const page=nav.dataset.view;if(pages.has(page))queueMicrotask(()=>mount(page));else sequence++;}
  });
  window.addEventListener('hashchange',()=>{const p=current();if(pages.has(p))mount(p);else sequence++;});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(pages.has(current()))mount(current())},{once:true});
  else if(pages.has(current()))mount(current());
})();
