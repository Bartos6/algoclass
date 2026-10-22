xxxconst tasks = {
  "Liczba parzysta": {
    path: "Instrukcje warunkowe / 1. Warunki if / else",
    level: 1, points: 10,
    description: `<h2>Treść zadania</h2><p>Wczytaj jedną liczbę całkowitą <code>n</code>. Sprawdź, czy jest parzysta.</p><p>Jeżeli liczba jest parzysta, wypisz <strong>TAK</strong>. W przeciwnym razie wypisz <strong>NIE</strong>.</p><h2>Dane wejściowe</h2><p>Jedna liczba całkowita <code>n</code>.</p><h2>Dane wyjściowe</h2><p>Napis <code>TAK</code> albo <code>NIE</code>.</p>`,
    input:"4", output:"TAK"
  },
  "Większa z dwóch liczb": {
    path: "Instrukcje warunkowe / 1. Warunki if / else",
    level: 1, points: 10,
    description: `<h2>Treść zadania</h2><p>Wczytaj dwie liczby całkowite <code>a</code> i <code>b</code>, a następnie wypisz większą z nich.</p><p>Jeżeli liczby są równe, wypisz ich wspólną wartość.</p><h2>Dane wejściowe</h2><p>Dwie liczby całkowite <code>a</code> i <code>b</code>.</p><h2>Dane wyjściowe</h2><p>Większa z podanych liczb.</p>`,
    input:"7 12", output:"12"
  },
  "Ocena z punktów": {
    path:"Instrukcje warunkowe / 2. if / else if / else", level:1, points:10,
    description:`<h2>Treść zadania</h2><p>Wczytaj liczbę punktów od 0 do 100 i wypisz odpowiadającą jej ocenę według progów podanych przez nauczyciela.</p><h2>Dane wejściowe</h2><p>Jedna liczba całkowita.</p>`,
    input:"85", output:"5"
  },
  "Największa z trzech liczb": {
    path:"Instrukcje warunkowe / 2. if / else if / else", level:2, points:15,
    description:`<h2>Treść zadania</h2><p>Wczytaj trzy liczby całkowite i wypisz największą z nich.</p>`,
    input:"4 9 2", output:"9"
  },
  "Przedział liczbowy": {
    path:"Instrukcje warunkowe / 3. Spójniki AND / OR", level:1, points:10,
    description:`<h2>Treść zadania</h2><p>Wczytaj liczbę całkowitą <code>x</code>. Jeżeli należy do przedziału od 10 do 20 włącznie, wypisz <strong>TAK</strong>, w przeciwnym razie <strong>NIE</strong>.</p>`,
    input:"15", output:"TAK"
  },
  "Rok przestępny": {
    path:"Instrukcje warunkowe / 3. Spójniki AND / OR", level:2, points:15,
    description:`<h2>Treść zadania</h2><p>Wczytaj rok i sprawdź, czy jest przestępny. Zastosuj zasady kalendarza gregoriańskiego.</p>`,
    input:"2024", output:"TAK"
  },
  "Suma liczb": {
    path:"Pętle", level:1, points:10,
    description:`<h2>Treść zadania</h2><p>Wczytaj liczbę <code>n</code> i oblicz sumę liczb całkowitych od 1 do <code>n</code>.</p>`,
    input:"5", output:"15"
  },
  "Silnia": {
    path:"Pętle", level:2, points:15,
    description:`<h2>Treść zadania</h2><p>Wczytaj nieujemną liczbę całkowitą <code>n</code> i oblicz <code>n!</code>.</p>`,
    input:"5", output:"120"
  },
  "Maksimum w tablicy": {
    path:"Tablice", level:1, points:10,
    description:`<h2>Treść zadania</h2><p>Wczytaj liczbę elementów tablicy, następnie jej elementy i wypisz największą wartość.</p>`,
    input:"5\n3 8 2 9 1", output:"9"
  }
};

const starter = `#include <iostream>
using namespace std;

int main() {
    // Napisz rozwiązanie tutaj

    return 0;
}
`;

const params = new URLSearchParams(location.search);
const requestedName = params.get("task") || "Liczba parzysta";
const task = tasks[requestedName] || tasks["Liczba parzysta"];
const taskName = tasks[requestedName] ? requestedName : "Liczba parzysta";

const taskSections={
 "Instrukcje warunkowe":[
  {group:"1. Warunki if / else",tasks:["Liczba parzysta","Większa z dwóch liczb"]},
  {group:"2. if / else if / else",tasks:["Ocena z punktów","Największa z trzech liczb"]},
  {group:"3. Spójniki AND / OR",tasks:["Przedział liczbowy","Rok przestępny"]}],
 "Pętle":[{group:"",tasks:["Suma liczb","Silnia"]}],
 "Tablice":[{group:"",tasks:["Maksimum w tablicy"]}]
};
const demoPassedTasks=new Set(["Liczba parzysta","Suma liczb","Maksimum w tablicy"]);
function renderSectionTaskList(){
 const box=document.getElementById("sectionTaskItems"); if(!box)return;
 let groups=[]; for(const g of Object.values(taskSections))if(g.some(x=>x.tasks.includes(taskName))){groups=g;break}
 groups.forEach(g=>{
  if(g.group){const h=document.createElement("div");h.className="section-task-group-title";h.textContent=g.group;box.appendChild(h)}
  g.tasks.forEach(name=>{
   const a=document.createElement("a");a.href=`task.html?task=${encodeURIComponent(name)}`;a.className="section-task-link"+(name===taskName?" current":"");
   const ok=demoPassedTasks.has(name),icon=document.createElement("span"),label=document.createElement("span");
   icon.className="task-status-icon"+(ok?" passed":"");icon.textContent=ok?"✓":"○";icon.title=ok?"Zadanie zaliczone":"Zadanie niezaliczone";label.textContent=name;a.append(icon,label);box.appendChild(a);
  });
 });
}

renderSectionTaskList();

document.title = `${taskName} | AlgoClass`;
document.getElementById("taskTitle").textContent = taskName;

document.getElementById("taskLevel").textContent = `Poziom ${task.level}`;
document.getElementById("taskPoints").textContent = `${task.points} pkt`;
document.getElementById("taskDescription").innerHTML = task.description;
document.getElementById("exampleInput").textContent = task.input;
document.getElementById("exampleOutput").textContent = task.output;

const editor = document.getElementById("codeEditor");
const input = document.getElementById("customInput");
const saveStatus = document.getElementById("saveStatus");
const resultPanel = document.getElementById("resultPanel");
// Runner and per-language draft handling are installed by code-runner.js.
const taskDrawer=document.getElementById("taskDrawer");
const taskDrawerToggle=document.getElementById("taskDrawerToggle");
const taskDrawerClose=document.getElementById("taskDrawerClose");
const taskDrawerBackdrop=document.getElementById("taskDrawerBackdrop");
function setTaskDrawer(open){
 taskDrawer.classList.toggle("open",open);
 taskDrawerBackdrop.classList.toggle("open",open);
 document.body.classList.toggle("drawer-open",open);
 taskDrawer.setAttribute("aria-hidden",String(!open));
 taskDrawerToggle.setAttribute("aria-expanded",String(open));
}
taskDrawerToggle?.addEventListener("click",()=>setTaskDrawer(true));
taskDrawerClose?.addEventListener("click",()=>setTaskDrawer(false));
taskDrawerBackdrop?.addEventListener("click",()=>setTaskDrawer(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape")setTaskDrawer(false)});


function setCurrentTheoryLink(){
  const button=document.getElementById("taskTheoryButton");
  if(!button)return;
  let chapter=null;
  for(const [name,groups] of Object.entries(taskSections)){
    if(groups.some(group=>group.tasks.includes(taskName))){chapter=name;break;}
  }
  const chapterAnchors={
    "Instrukcje warunkowe":"warunki",
    "Pętle":"petle",
    "Tablice":"tablice"
  };
  button.href=`theory.html#${chapterAnchors[chapter] || "warunki"}`;
  button.title=chapter ? `Teoria: ${chapter}` : "Teoria";
}
setCurrentTheoryLink();
