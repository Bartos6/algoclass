document.addEventListener('DOMContentLoaded', async () => {
  'use strict';
  const id = new URLSearchParams(location.search).get('cloud');
  const missing = document.getElementById('missing');
  if (!id) {
    missing.hidden = false;
    missing.textContent = 'Otwórz kartę przypisaną do klasy w panelu ucznia.';
    return;
  }
  try {
    if (!window.AlgoCloud?.configured()) throw Error('Nie skonfigurowano Supabase.');
    const db = await AlgoCloud.connect();
    const user = await AlgoCloud.session();
    if (!user) throw Error('Zaloguj się na konto ucznia.');
    const { data, error } = await db.rpc('ac_student_worksheet', { p_assignment: id });
    if (error) throw error;
    if (!data?.tasks?.length) throw Error('Brak zadań w karcie.');
    // Dane zwracane przez RPC nie zawierają wzorcowych wartości ani outputu.
    window.AlgoCloudSheet = data;
    const script = document.createElement('script');
    script.src = 'js/worksheet-player.js?v=pilot-1';
    script.onerror = () => { missing.hidden = false; missing.textContent = 'Nie udało się załadować karty.'; };
    document.body.append(script);
  } catch (error) {
    missing.hidden = false;
    missing.textContent = 'Nie można otworzyć karty: ' + (error.message || String(error));
  }
});
