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
const $=id=>document.getElementById(id), topic=$('traceTopic'),lang=$('traceLanguage'),pick=$('traceExercise'),form=$('traceForm');if(!form)return;
const storage='algoclass-code-tracing-v1';let task;const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){try{return JSON.parse(localStorage.getItem(storage))||{}}catch{return {}}}function store(data){try{localStorage.setItem(storage,JSON.stringify(data));return true}catch{return false}}
function inputs(){return [...form.querySelectorAll('[data-trace-cell]')]}function collect(){return {cells:inputs().map(x=>x.value.trim()),output:$('traceOutput').value.trim()}}
function render(){task=tasks.find(x=>x.id===pick.value);if(!task)return;$('traceTitle').textContent=task.title;$('traceInstruction').textContent=task.instruction;$('traceCode').textContent=task.code;$('traceInput').textContent=task.input;$('traceProgress').textContent=`${task.rows.length} etapów • ${task.vars.length} zmiennych`;$('traceTableHead').innerHTML='<tr><th scope="col">Po instrukcji</th>'+task.vars.map(v=>`<th scope="col">${escape(v)}</th>`).join('')+'</tr>';$('traceTableBody').innerHTML=task.rows.map((r,i)=>`<tr><th scope="row">${escape(r[0])}</th>${r[1].map((_,j)=>`<td><input data-trace-cell="${i}-${j}" aria-label="${escape(task.vars[j])} po etapie ${i+1}" autocomplete="off" spellcheck="false" placeholder="?" /></td>`).join('')}</tr>`).join('');const saved=read()[task.id];if(saved){inputs().forEach((el,i)=>el.value=saved.cells?.[i]||'');$('traceOutput').value=saved.output||''}else{$('traceOutput').value=''}$('traceFeedback').textContent='';$('traceSolution').hidden=true;$('traceSolution').innerHTML='';}
function choices(){const filtered=tasks.filter(x=>x.topic===topic.value&&x.lang===lang.value);pick.innerHTML=filtered.map((x,i)=>`<option value="${x.id}">${i+1}. ${escape(x.title)}</option>`).join('');render()}
topic.addEventListener('change',choices);lang.addEventListener('change',choices);pick.addEventListener('change',render);
$('traceSave').addEventListener('click',()=>{const d=read();d[task.id]=collect();$('traceFeedback').textContent=store(d)?'Zapisano odpowiedzi w tej przeglądarce.':'Nie udało się zapisać odpowiedzi.'});
$('traceHint').addEventListener('click',()=>{$('traceFeedback').textContent='Podpowiedź: '+task.hint});
$('traceReset').addEventListener('click',()=>{inputs().forEach(el=>{el.value='';el.classList.remove('trace-ok','trace-wrong')});$('traceOutput').value='';$('traceFeedback').textContent='Wyczyszczono formularz. Kliknij „Zapisz odpowiedzi”, aby zaktualizować zapis.';$('traceSolution').hidden=true});
form.addEventListener('submit',e=>{e.preventDefault();const answers=collect(),correct=task.rows.flatMap(r=>r[1]);let score=0;inputs().forEach((el,i)=>{const ok=answers.cells[i]===correct[i];el.classList.toggle('trace-ok',ok);el.classList.toggle('trace-wrong',!ok);if(ok)score++});const norm=s=>s.trim().replace(/\r\n/g,'\n').split('\n').map(line=>line.trim().replace(/\s+/g,' ')).join('\n');const outputOk=norm(answers.output)===norm(task.output);if(outputOk)score++;const total=correct.length+1;$('traceFeedback').textContent=`Wynik: ${score}/${total} pkt. ${score===total?'Brawo! Wszystkie odpowiedzi są poprawne.':'Popraw pola zaznaczone na czerwono i spróbuj ponownie.'} Output: ${outputOk?'poprawny':'niepoprawny'}.`;const d=read();d[task.id]=answers;store(d);$('traceSolution').hidden=false;$('traceSolution').innerHTML='<strong>Poprawny przebieg — sprawdź po własnej próbie:</strong><div class="trace-table-scroll"><table class="trace-table"><thead><tr><th>Po instrukcji</th>'+task.vars.map(v=>`<th>${escape(v)}</th>`).join('')+'</tr></thead><tbody>'+task.rows.map(r=>'<tr><th>'+escape(r[0])+'</th>'+r[1].map(v=>'<td>'+escape(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><strong>Output:</strong><pre class="trace-code">'+escape(task.output)+'</pre>'});
choices();
})();