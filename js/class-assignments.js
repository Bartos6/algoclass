(()=>{
'use strict';
const classId=new URLSearchParams(location.search).get('id');
const classesKey='algoclass-teacher-classes-v1';
const key='algoclass-class-assignments-v1';
const exampleTasks=[
  {id:'demo:even',title:'Liczba parzysta',chapter:'Instrukcje warunkowe'},
  {id:'demo:greater',title:'Większa z dwóch liczb',chapter:'Instrukcje warunkowe'},
  {id:'demo:grade',title:'Ocena z punktów',chapter:'Instrukcje warunkowe'},
  {id:'demo:sum',title:'Suma liczb',chapter:'Pętle'},
  {id:'demo:factorial',title:'Silnia',chapter:'Pętle'},
  {id:'demo:max',title:'Maksimum w tablicy',chapter:'Tablice'}
];
const read=(name,fallback)=>{try{return JSON.parse(localStorage.getItem(name))??fallback}catch{return fallback}};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getTasks=()=>{
 const own=read('algoclass-teacher-tasks',[]);
 return [...exampleTasks,...(Array.isArray(own)?own.map(x=>({id:'own:'+x.id,title:x.title,chapter:x.chapter})):[])];
};
const getAssignments=()=>{const obj=read(key,{});return Array.isArray(obj[classId])?obj[classId]:[]};
const setAssignments=items=>{const obj=read(key,{});obj[classId]=items;localStorage.setItem(key,JSON.stringify(obj))};
const classExists=()=>{const classes=read(classesKey,null);const ids=Array.isArray(classes)?classes.map(x=>x.id):['demo-2a','demo-3b','demo-1c'];return ids.includes(classId)};
function render(){
 const mount=document.getElementById('classAssignments');if(!mount||!classExists())return;
 const tasks=getTasks(),items=getAssignments();
 mount.innerHTML=`<section class="card assignment-card"><div class="section-head"><h2>Zadania klasy (${items.length})</h2></div><p class="muted">Przypisz zadania z biblioteki i określ termin ich wykonania.</p><form id="assignmentForm" class="assignment-form"><label>Zadanie<select name="task" required><option value="">Wybierz zadanie</option>${tasks.filter(t=>!items.some(a=>a.taskId===t.id)).map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)} — ${escapeHtml(t.chapter)}</option>`).join('')}</select></label><label>Termin wykonania (opcjonalnie)<input type="date" name="deadline"></label><button type="submit" class="button">+ Przypisz zadanie</button></form><div id="assignmentFeedback" role="status" aria-live="polite"></div>${items.length?`<div class="table-wrap"><table><thead><tr><th>Zadanie</th><th>Dział</th><th>Termin</th><th>Akcja</th></tr></thead><tbody>${items.map(a=>{const task=tasks.find(t=>t.id===a.taskId);return `<tr><td><strong>${escapeHtml(task?.title||a.title||'Zadanie usunięte z biblioteki')}</strong></td><td>${escapeHtml(task?.chapter||a.chapter||'—')}</td><td>${escapeHtml(a.deadline||'Bez terminu')}</td><td><button class="button secondary remove-assignment" type="button" data-task="${escapeHtml(a.taskId)}">Usuń przypisanie</button></td></tr>`}).join('')}</tbody></table></div>`:'<p class="assignment-empty">Nie przypisano jeszcze żadnych zadań.</p>'}<p class="class-note">To wersja demonstracyjna. Przypisania są zapisywane tylko w tej przeglądarce i nie są jeszcze widoczne dla uczniów.</p></section>`;
 mount.querySelector('#assignmentForm').onsubmit=e=>{e.preventDefault();const data=new FormData(e.currentTarget),task=tasks.find(t=>t.id===data.get('task'));if(!task)return;const updated=getAssignments();if(updated.some(x=>x.taskId===task.id))return;updated.push({taskId:task.id,title:task.title,chapter:task.chapter,deadline:String(data.get('deadline')||'')});setAssignments(updated);render()};
 mount.querySelectorAll('.remove-assignment').forEach(button=>button.onclick=()=>{if(!confirm('Usunąć przypisanie zadania do tej klasy?'))return;setAssignments(getAssignments().filter(x=>x.taskId!==button.dataset.task));render()});
}
const target=document.getElementById('classDetail');
if(target&&classExists()){
 const section=document.createElement('div');section.id='classAssignments';target.after(section);render();
}
})();
