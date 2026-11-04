(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const sheet = window.AlgoCloudSheet;
  if (!sheet?.tasks?.length) { el('missing').hidden = false; return; }
  el('player').hidden = false;
  el('sheetName').textContent = sheet.title;
  document.title = sheet.title + ' – AlgoClass';
  el('codeHeading').textContent = 'Kod ' + (sheet.lang === 'python' ? 'Python' : 'C++');
  const answers = {};
  let selected = 0, db, user, remoteState = null;
  let timer = null, saving = Promise.resolve(), loading = true, lastError = '';
  const msg = text => { el('submissionMessage').textContent = text; };
  const getEntry = id => answers[id] ||= {memory:{},output:'',checked:false};
  function storeCurrent() {
    const entry = getEntry(sheet.tasks[selected].id);
    el('fields').querySelectorAll('[data-var]').forEach(x => { entry.memory[x.dataset.var] = x.value; });
    entry.output = el('output').value;
  }
  function summary() {
    const checked = sheet.tasks.filter(t => getEntry(t.id).checked).length;
    const completed = sheet.tasks.filter(t => remoteState?.grades?.[t.id]?.done).length;
    el('progressText').textContent = 'Poprawnie rozwiązane: ' + completed + ' / ' + sheet.tasks.length;
    el('bar').style.width = (100*completed/sheet.tasks.length) + '%';
    el('worksheetStatus').textContent = remoteState?.status === 'submitted' ? 'Oddana' :
      sheet.tasks.some(t => {
        const v=getEntry(t.id);
        return !!v.output.trim() || Object.values(v.memory).some(x => String(x).trim());
      }) ? 'W trakcie' : 'Nierozpoczęta';
    el('worksheetScore').textContent = remoteState ?
      'Sprawdzone zadania: ' + remoteState.checked + '/' + sheet.tasks.length +
      ' · Punkty: ' + remoteState.points + '/' + remoteState.maxPoints +
      ' (' + remoteState.percent + '%)' : 'Wynik: jeszcze nie sprawdzono.';
  }
  function render() {
    const task = sheet.tasks[selected], entry = getEntry(task.id);
    el('number').textContent = 'Zadanie ' + (selected+1) + ' / ' + sheet.tasks.length;
    el('level').textContent = 'Poziom ' + (task.level || 1);
    el('title').textContent = task.title || 'Zadanie';
    el('code').textContent = task.code || '';
    el('inputData').textContent = task.input || '(brak danych)';
    el('fields').replaceChildren();
    Object.keys(task.memory || {}).forEach(name => {
      const wrap = document.createElement('div');
      const label = document.createElement('label'); label.textContent = name + ' =';
      const input = document.createElement('input'); input.dataset.var = name;
      input.value = entry.memory?.[name] || ''; input.placeholder = 'np. 3, 2, 1, 0';
      input.autocomplete = 'off'; wrap.append(label,input); el('fields').append(wrap);
    });
    el('output').value = entry.output || '';
    el('result').hidden = true;
    el('tasks').replaceChildren();
    sheet.tasks.forEach((t,i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'task' + (i === selected ? ' active' : '') +
        (remoteState?.grades?.[t.id]?.done ? ' done' : '');
      button.textContent = i+1; button.title = t.title;
      button.onclick = () => { storeCurrent(); selected = i; render(); };
      el('tasks').append(button);
    });
    summary();
  }
  // Jedna kolejka żądań zabezpiecza przed nadpisaniem nowszej wersji starszą.
  function save(checkTask = null, submit = false) {
    clearTimeout(timer);
    storeCurrent();
    const payload = JSON.parse(JSON.stringify(answers));
    saving = saving.catch(() => {}).then(async () => {
      if (!db || !user) throw Error('Brak połączenia z kontem ucznia.');
      const {data,error} = await db.rpc('ac_save_student_progress',{
        p_assignment:sheet.id,p_answers:payload,p_check_task:checkTask,p_submit:submit
      });
      if (error) throw error;
      remoteState = data;
      lastError = '';
      if (submit) msg('Karta została oddana nauczycielowi.');
      else if (checkTask === null) msg('Postęp zapisany.');
      summary();
      return data;
    }).catch(error => {
      lastError = error.message || String(error);
      msg('Nie udało się zapisać pracy: ' + lastError);
      throw error;
    });
    return saving;
  }
  function schedule() {
    if (loading) return;
    clearTimeout(timer);
    msg('Zapisywanie zmian…');
    timer = setTimeout(() => { save().catch(() => {}); }, 1100);
  }
  function changed() {
    const entry = getEntry(sheet.tasks[selected].id);
    entry.checked = false;
    storeCurrent();
    remoteState = null; // Nie pokazuj nieaktualnej punktacji po zmianach.
    summary(); schedule();
  }
  el('fields').addEventListener('input', changed);
  el('output').addEventListener('input', changed);
  el('check').onclick = async () => {
    const task = sheet.tasks[selected];
    try {
      el('check').disabled = true;
      const result = await save(task.id,false);
      getEntry(task.id).checked = true;
      const grade = result.grades?.[task.id];
      if (!grade) throw Error('Nie otrzymano wyniku zadania.');
      const lines = (grade.feedback || []).map(f => (f.correct ? '✓ ' : '✗ ') + f.name +
        (f.correct ? ' — poprawnie' : ('expected' in f ? ' — oczekiwane: ' + f.expected : ' — niepoprawnie')));
      el('result').hidden = false;
      el('result').textContent = 'Wynik: ' + grade.points + ' / ' + grade.maxPoints + '\n' + lines.join('\n');
      el('result').className = 'result ' + (grade.done ? 'good' : 'bad');
      renderTaskMarkers();
    } catch (error) { msg('Nie udało się sprawdzić zadania: ' + error.message); }
    finally { el('check').disabled = false; }
  };
  function renderTaskMarkers() {
    [...el('tasks').children].forEach((b,i) => b.classList.toggle('done', !!remoteState?.grades?.[sheet.tasks[i].id]?.done));
    const completed=sheet.tasks.filter(t=>remoteState?.grades?.[t.id]?.done).length;
    el('progressText').textContent='Poprawnie rozwiązane: '+completed+' / '+sheet.tasks.length;
    el('bar').style.width=100*completed/sheet.tasks.length+'%';
  }
  el('clear').onclick = () => {
    answers[sheet.tasks[selected].id] = { memory:{},output:'',checked:false };
    remoteState = null; render(); schedule();
  };
  el('next').onclick = () => { storeCurrent(); selected = (selected+1)%sheet.tasks.length; render(); };
  el('saveProgress').onclick = async () => {
    try { el('saveProgress').disabled=true; await save(); msg('Postęp zapisany na Twoim koncie.'); }
    catch(error) { msg('Nie udało się zapisać postępu: ' + error.message); }
    finally { el('saveProgress').disabled=false; }
  };
  el('submitWorksheet').onclick = async () => {
    storeCurrent();
    const untouched = sheet.tasks.filter(t => {
      const e = getEntry(t.id);
      return !e.checked || (!e.output.trim() && !Object.values(e.memory).some(v => String(v).trim()));
    }).length;
    if (untouched && !confirm('Nie wszystkie zadania zrobione ('+untouched+' z '+sheet.tasks.length+'). Czy na pewno chcesz przesłać?')) return;
    try {
      el('submitWorksheet').disabled=true;
      await save(null,true); msg('Karta pracy została oddana nauczycielowi.');
    } catch(error) { msg('Nie udało się oddać karty: ' + error.message); }
    finally { el('submitWorksheet').disabled=false; }
  };
  (async () => {
    try {
      db = await AlgoCloud.connect(); user = await AlgoCloud.session();
      if (!user) throw Error('Zaloguj się, aby rozwiązywać kartę.');
      const {data,error} = await db.from('worksheet_progress')
        .select('answers,status,points,max_points,percent')
        .eq('assignment_id',sheet.id).eq('student_id',user.id).maybeSingle();
      if (error) throw error;
      if (data?.answers && typeof data.answers === 'object') Object.assign(answers,data.answers);
      // Wyniki zapisane online są prawdziwe, ale powtórne sprawdzenie zwraca detale zadania.
      remoteState = data ? {points:data.points||0,maxPoints:data.max_points||0,
        percent:data.percent||0,checked:Object.values(answers).filter(e=>e?.checked).length,
        status:data.status,grades:{}} : null;
      loading=false; render();
      if (data?.status==='submitted') {
        el('worksheetStatus').textContent='Oddana';
        msg('Wczytano oddaną pracę.');
      } else if(data) msg('Wczytano zapisane odpowiedzi.');
    } catch(error) {
      el('player').hidden=true; el('missing').hidden=false;
      el('missing').textContent='Nie można wczytać postępu: '+(error.message||String(error));
    }
  })();
})();
