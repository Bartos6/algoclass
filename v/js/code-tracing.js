(()=>{'use strict';
const tasks=[
{id:'if-cpp-1',topic:'if',lang:'cpp',title:'Porównywanie liczb',instruction:'Wczytaj dwie liczby. Zwróć uwagę, która gałąź warunku się wykona.',code:`#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    if (a > b) {
        a = a - b;
    } else {
        b = b - a;
    }
    cout << a << " " << b << "\\n";
}`,input:'4 9',vars:['a','b'],rows:[['cin >> a >> b;',['4','9']],['if (a > b) / else → b = b - a;',['4','5']]],output:'4 5',hint:'4 > 9 jest fałszem, więc wykona się gałąź else.'},
{id:'if-cpp-2',topic:'if',lang:'cpp',title:'Dwa niezależne warunki',instruction:'Sprawdź oba warunki w kolejności występowania.',code:`#include <iostream>
using namespace std;
int main() {
    int x;
    cin >> x;
    if (x % 2 == 0) x = x + 3;
    if (x > 6) x = x - 2;
    cout << x << "\\n";
}`,input:'4',vars:['x'],rows:[['cin >> x;',['4']],['if (x % 2 == 0) x = x + 3;',['7']],['if (x > 6) x = x - 2;',['5']]],output:'5',hint:'Po pierwszym if wartość x wynosi 7. Drugi if sprawdza już tę nową wartość.'},
{id:'if-python-1',topic:'if',lang:'python',title:'Porównywanie liczb',instruction:'Wczytaj dwie liczby. Zwróć uwagę, która gałąź warunku się wykona.',code:`a, b = map(int, input().split())
if a > b:
    a = a - b
else:
    b = b - a
print(a, b)`,input:'4 9',vars:['a','b'],rows:[['a, b = map(int, input().split())',['4','9']],['if a > b / else → b = b - a',['4','5']]],output:'4 5',hint:'4 > 9 jest fałszem, więc wykona się else.'},
{id:'if-python-2',topic:'if',lang:'python',title:'Dwa niezależne warunki',instruction:'Sprawdź oba warunki w kolejności występowania.',code:`x = int(input())
if x % 2 == 0:
    x = x + 3
if x > 6:
    x = x - 2
print(x)`,input:'4',vars:['x'],rows:[['x = int(input())',['4']],['if x % 2 == 0 → x = x + 3',['7']],['if x > 6 → x = x - 2',['5']]],output:'5',hint:'Po pierwszym if x ma wartość 7, więc drugi if również się wykona.'},
{id:'while-cpp-1',topic:'while',lang:'cpp',title:'Suma kolejnych liczb',instruction:'Każdy wiersz odpowiada jednej wykonanej instrukcji. Obserwuj licznik i sumę.',code:`#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    int i = 1, suma = 0;
    while (i <= n) {
        suma = suma + i;
        i = i + 1;
    }
    cout << suma << "\\n";
}`,input:'3',vars:['n','i','suma'],rows:[['cin >> n;',['3','—','—']],['int i = 1, suma = 0;',['3','1','0']],['1. obrót: suma = suma + i;',['3','1','1']],['1. obrót: i = i + 1;',['3','2','1']],['2. obrót: suma = suma + i;',['3','2','3']],['2. obrót: i = i + 1;',['3','3','3']],['3. obrót: suma = suma + i;',['3','3','6']],['3. obrót: i = i + 1;',['3','4','6']]],output:'6',hint:'Pętla wykonuje się dla i = 1, 2, 3. Po zwiększeniu i do 4 warunek 4 <= 3 jest fałszywy.'},
{id:'while-cpp-2',topic:'while',lang:'cpp',title:'Zmniejszanie liczby',instruction:'Przeanalizuj dzielenie całkowite przez 2.',code:`#include <iostream>
using namespace std;
int main() {
    int x, kroki = 0;
    cin >> x;
    while (x > 1) {
        x = x / 2;
        kroki++;
    }
    cout << x << " " << kroki << "\\n";
}`,input:'10',vars:['x','kroki'],rows:[['int x, kroki = 0;',['—','0']],['cin >> x;',['10','0']],['1. obrót: x = x / 2;',['5','0']],['1. obrót: kroki++;',['5','1']],['2. obrót: x = x / 2;',['2','1']],['2. obrót: kroki++;',['2','2']],['3. obrót: x = x / 2;',['1','2']],['3. obrót: kroki++;',['1','3']]],output:'1 3',hint:'W C++ przy zmiennych int wyrażenie 5 / 2 daje 2, bez części ułamkowej.'},
{id:'while-python-1',topic:'while',lang:'python',title:'Suma kolejnych liczb',instruction:'Każdy wiersz odpowiada jednej wykonanej instrukcji. Obserwuj licznik i sumę.',code:`n = int(input())
i = 1
suma = 0
while i <= n:
    suma = suma + i
    i = i + 1
print(suma)`,input:'3',vars:['n','i','suma'],rows:[['n = int(input())',['3','—','—']],['i = 1',['3','1','—']],['suma = 0',['3','1','0']],['1. obrót: suma = suma + i',['3','1','1']],['1. obrót: i = i + 1',['3','2','1']],['2. obrót: suma = suma + i',['3','2','3']],['2. obrót: i = i + 1',['3','3','3']],['3. obrót: suma = suma + i',['3','3','6']],['3. obrót: i = i + 1',['3','4','6']]],output:'6',hint:'Pętla wykonuje się dla i = 1, 2, 3, a następnie zatrzymuje przy i = 4.'},
{id:'while-python-2',topic:'while',lang:'python',title:'Zmniejszanie liczby',instruction:'Przeanalizuj dzielenie całkowite przez 2.',code:`x = int(input())
kroki = 0
while x > 1:
    x = x // 2
    kroki += 1
print(x, kroki)`,input:'10',vars:['x','kroki'],rows:[['x = int(input())',['10','—']],['kroki = 0',['10','0']],['1. obrót: x = x // 2',['5','0']],['1. obrót: kroki += 1',['5','1']],['2. obrót: x = x // 2',['2','1']],['2. obrót: kroki += 1',['2','2']],['3. obrót: x = x // 2',['1','2']],['3. obrót: kroki += 1',['1','3']]],output:'1 3',hint:'Operator // w Pythonie wykonuje dzielenie całkowite: 5 // 2 daje 2.'}
];
const el=id=>document.getElementById(id), topic=el('traceTopic'),lang=el('traceLanguage'),form=el('traceForm');if(!form)return;
const KEY='algoclass-trace-kp3-v1';let selected=0;let saved={};try{saved=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
const norm=s=>String(s).trim().replace(/\s*,\s*/g,',').replace(/\s+/g,' ');
const outNorm=s=>String(s).replace(/\r\n/g,'\n').replace(/[ \t]+(?=\n|$)/g,'').replace(/\n+$/,'');
function group(){return tasks.filter(t=>t.topic===topic.value&&t.lang===lang.value)}
function memory(t){const result={};t.vars.forEach((v,i)=>{const values=[];t.rows.forEach(row=>{const val=row[1][i];if(val!=='—'&&val!==undefined&&values[values.length-1]!==val)values.push(val)});result[v]=values.join(', ')});return result}
function save(){try{localStorage.setItem(KEY,JSON.stringify(saved))}catch{}}
function current(){return group()[selected]}
function collect(){const t=current();if(!t)return;const s=saved[t.id]||{memory:{},output:'',done:false};el('traceFields').querySelectorAll('[data-var]').forEach(input=>s.memory[input.dataset.var]=input.value);s.output=el('traceOutput').value;saved[t.id]=s;save()}
function render(){const t=current();if(!t)return;const s=saved[t.id]||{memory:{},output:'',done:false};el('traceNumber').textContent='Zadanie '+(selected+1)+' / '+group().length;el('traceLevel').textContent=t.topic==='if'?'Warunki if':'Pętla while';el('traceTitle').textContent=t.title;el('traceInstruction').textContent=t.instruction;el('traceCodeHeading').textContent='Kod '+(t.lang==='cpp'?'C++':'Python');el('traceCode').textContent=t.code;el('traceInput').textContent=t.input;el('traceFields').replaceChildren();for(const v of t.vars){const wrap=document.createElement('div');const label=document.createElement('label');label.textContent=v+' =';const input=document.createElement('input');input.dataset.var=v;input.setAttribute('aria-label','Historia wartości zmiennej '+v);input.placeholder='np. 12, 1, 0';input.autocomplete='off';input.value=s.memory?.[v]||'';wrap.append(label,input);el('traceFields').append(wrap)}el('traceOutput').value=s.output||'';el('traceFeedback').hidden=true;drawTasks()}
function drawTasks(){const list=group();el('traceTasks').replaceChildren();list.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='trace-task'+(i===selected?' active':'')+(saved[t.id]?.done?' done':'');b.textContent=i+1;b.title=t.title;b.onclick=()=>{collect();selected=i;render()};el('traceTasks').append(b)});const done=list.filter(t=>saved[t.id]?.done).length;el('traceProgressText').textContent='Rozwiązane: '+done+' / '+list.length;el('traceProgressBar').style.width=(list.length?100*done/list.length:0)+'%'}
function switchGroup(){collect();selected=0;render()}
topic.addEventListener('change',switchGroup);lang.addEventListener('change',switchGroup);
form.addEventListener('input',()=>{const t=current();if(saved[t.id]?.done){saved[t.id].done=false;drawTasks()}});
form.addEventListener('submit',e=>{e.preventDefault();collect();const t=current(),s=saved[t.id],expected=memory(t);let good=0;const lines=[];for(const [v,answer] of Object.entries(expected)){const ok=norm(s.memory[v]||'')===norm(answer);if(ok)good++;lines.push((ok?'✓ ':'✗ ')+v+(ok?' — poprawnie':' — oczekiwane: '+answer))}const ok=outNorm(s.output)===outNorm(t.output);if(ok)good++;lines.push((ok?'✓ Output — poprawnie':'✗ Output — oczekiwane: '+JSON.stringify(t.output)));const total=t.vars.length+1;s.done=good===total;save();el('traceFeedback').hidden=false;el('traceFeedback').textContent='Wynik: '+good+' / '+total+'\n'+lines.join('\n');el('traceFeedback').className='trace-result '+(s.done?'trace-good':'trace-bad');drawTasks()});
el('traceReveal').onclick=()=>{const t=current(),expected=memory(t);el('traceFields').querySelectorAll('[data-var]').forEach(input=>input.value=expected[input.dataset.var]);el('traceOutput').value=t.output;collect();el('traceFeedback').hidden=true};
el('traceClear').onclick=()=>{const t=current();saved[t.id]={memory:{},output:'',done:false};save();render()};
el('traceNext').onclick=()=>{collect();selected=(selected+1)%group().length;render()};render();
})();
