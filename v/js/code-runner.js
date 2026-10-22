(()=>{'use strict';
const $=id=>document.getElementById(id);
const editor=$('codeEditor'),language=$('codeLanguage'),input=$('customInput'),status=$('saveStatus'),panel=$('resultPanel'),run=$('runButton'),save=$('submitButton');
if(!editor||!language||!run)return;
const taskId=new URLSearchParams(location.search).get('task')||'Liczba parzysta';
const starters={cpp:'#include <iostream>\nusing namespace std;\n\nint main() {\n    // Napisz rozwiązanie tutaj\n\n    return 0;\n}\n',python:'# Napisz rozwiązanie tutaj\n'};
const key=lang=>'algoclass-code-draft-v2:'+taskId+':'+lang;
const inputKey='algoclass-code-input-v2:'+taskId;
const legacy='algoclass-draft:'+taskId;
let timer;
function persist(){try{localStorage.setItem(key(language.value),editor.value);localStorage.setItem(inputKey,input.value);status.textContent='Szkic zapisany w tej przeglądarce'}catch{status.textContent='Nie udało się zapisać szkicu'}}
function restore(){let value=null;try{value=localStorage.getItem(key(language.value));if(value===null&&language.value==='cpp')value=localStorage.getItem(legacy)}catch{}editor.value=value===null?starters[language.value]:value;status.textContent='Szkic zapisuje się automatycznie';}
restore();try{const previousInput=localStorage.getItem(inputKey);if(previousInput!==null)input.value=previousInput}catch{}
let currentLanguage='cpp';language.addEventListener('change',()=>{try{localStorage.setItem(key(currentLanguage),editor.value)}catch{}currentLanguage=language.value;restore();panel.innerHTML='<div class="result-empty"><strong>Nowy język</strong><p>Uruchom kod, aby zobaczyć jego wynik.</p></div>'});
for(const field of [editor,input])field.addEventListener('input',()=>{status.textContent='Zapisywanie...';clearTimeout(timer);timer=setTimeout(persist,350)});
editor.addEventListener('keydown',event=>{if(event.key!=='Tab')return;event.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;editor.setRangeText('    ',start,end,'end');editor.dispatchEvent(new Event('input'))});
function result(title,parts,footnote='',error=false){panel.replaceChildren();panel.classList.add('runner-result');const head=document.createElement('div');head.className='result-header';const strong=document.createElement('strong');strong.textContent=title;head.append(strong);const body=document.createElement('div');body.className='result-body';parts.forEach(([label,value])=>{const container=document.createElement('div');const t=document.createElement('div');t.className='runner-output-label'+(error?' runner-error':'');t.textContent=label;const pre=document.createElement('pre');pre.textContent=String(value??'');container.append(t,pre);body.append(container)});if(footnote){const p=document.createElement('p');p.className='runner-footnote';p.textContent=footnote;body.append(p)}panel.append(head,body)}
run.addEventListener('click',async()=>{
 persist();const source=editor.value;if(!source.trim()){result('Brak kodu',[],'Najpierw wpisz kod programu.');return}
 if(source.length>30000||input.value.length>10000){result('Za duże dane',[],'Limit: 30 000 znaków kodu i 10 000 znaków wejścia.');return}
 run.disabled=true;run.classList.add('runner-busy');run.textContent='Uruchamianie...';result('Uruchamianie',[],'Trwa sprawdzanie dostępu do usługi wykonawczej.');
 try{
  const api=window.AlgoCloud;if(!api?.configured()){throw new Error('Najpierw skonfiguruj Supabase w js/supabase-config.js.')}
  const client=await api.connect();const {data:{session},error:sessionError}=await client.auth.getSession();if(sessionError||!session)throw new Error('Zaloguj się, aby uruchomić program.');
  const {data,error}=await client.functions.invoke('run-code',{body:{language:language.value,code:source,stdin:input.value}});
  if(error)throw new Error(error.message||'Nie udało się połączyć z usługą uruchamiania kodu.');
  if(!data||data.ok!==true)throw new Error(data?.error||'Usługa uruchamiania kodu zwróciła błąd.');
  const out=String(data.stdout||''),stderr=String(data.stderr||''),compile=String(data.compile_output||'');
  const parts=[['Output (stdout)',out||'(pusty)']];if(compile)parts.push(['Kompilator',compile]);if(stderr)parts.push(['Błędy (stderr)',stderr]);
  result('Wynik uruchomienia',parts,`Kod zakończenia: ${data.exit_code??'brak'} · To uruchomienie na własnym wejściu, nie ocena zadania.`,Boolean(stderr||compile||data.exit_code));
 }catch(error){result('Nie udało się uruchomić programu',[],String(error?.message||error)+' Wdróż funkcję run-code zgodnie z plikiem KROK-10.md.');}
 finally{run.disabled=false;run.classList.remove('runner-busy');run.textContent='▶ Uruchom'}
});
save.addEventListener('click',()=>{clearTimeout(timer);persist();result('Szkic zapisany',[],'Kod został zapisany lokalnie dla tego zadania i wybranego języka. Wysyłanie do oceny oraz testy ukryte dodamy w następnym kroku.')});
})();