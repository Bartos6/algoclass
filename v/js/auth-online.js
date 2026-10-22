// AlgoClass – logowanie / rejestracja / resetowanie hasła (Supabase)
(() => {
  'use strict';
  const start = () => {
    const form = document.getElementById('loginForm') || document.getElementById('registerForm') || document.getElementById('resetForm');
    if (!form) return;
    const action = form.id;
    const message = document.getElementById('loginMessage') || document.getElementById('registerMessage') || document.getElementById('resetMessage');
    const button = form.querySelector('button[type="submit"]');
    const report = (text, error = false) => {
      if (!message) return;
      message.textContent = text;
      message.className = 'form-message ' + (error ? 'error' : 'info');
      message.style.display = 'block';
    };
    if (!window.AlgoCloud || !window.AlgoCloud.configured()) {
      report('Brak konfiguracji Supabase. Sprawdź adres projektu i klucz publiczny w js/supabase-config.js.', true);
      return;
    }
    // Używamy capture, aby starszy demonstracyjny handler nie przejął zdarzenia.
    form.addEventListener('submit', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (button.disabled) return;
      button.disabled = true;
      report('Trwa logowanie…');
      try {
        const email = (form.querySelector('#email')?.value || '').trim();
        const password = form.querySelector('#password')?.value || '';
        if (!email) throw new Error('Wpisz adres e-mail.');
        if (action !== 'resetForm' && !password) throw new Error('Wpisz hasło.');
        const db = await window.AlgoCloud.connect();
        if (!db) throw new Error('Nie można uruchomić połączenia z Supabase.');
        if (action === 'loginForm') {
          const { data, error } = await db.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (!data.user) throw new Error('Serwer nie zwrócił informacji o zalogowanym użytkowniku.');
          report('Zalogowano. Sprawdzanie uprawnień…');
          const { data: profile, error: profileError } = await db.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
          if (profileError) throw new Error('Konto zostało zalogowane, ale nie udało się odczytać roli w tabeli profiles: ' + profileError.message);
          if (!profile) throw new Error('Konto zostało zalogowane, ale nie ma rekordu w tabeli profiles. Uruchom skrypt SQL z Kroku 9 lub uzupełnij profil.');
          if (profile.role !== 'teacher' && profile.role !== 'student') throw new Error('Nieznana rola konta: ' + profile.role);
          window.location.assign(profile.role === 'teacher' ? 'teacher.html' : 'student.html');
        } else if (action === 'registerForm') {
          if (form.querySelector('#password2')?.value !== password) throw new Error('Hasła nie są identyczne.');
          if (password.length < 8) throw new Error('Hasło musi mieć co najmniej 8 znaków.');
          report('Trwa rejestracja…');
          const { data, error } = await db.auth.signUp({ email, password, options: { emailRedirectTo: new URL('index.html', location.href).href } });
          if (error) throw error;
          report(data.session ? 'Konto utworzone. Możesz się zalogować.' : 'Sprawdź e-mail i potwierdź rejestrację, a następnie zaloguj się.');
        } else {
          const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: new URL('new-password.html', location.href).href });
          if (error) throw error;
          report('Jeśli podany adres istnieje, otrzymasz wiadomość z linkiem do resetowania hasła.');
        }
      } catch (err) {
        const text = err?.message || String(err);
        const translated = /invalid login credentials/i.test(text) ? 'Nieprawidłowy e-mail lub hasło.' : /email not confirmed/i.test(text) ? 'Potwierdź adres e-mail, korzystając z linku wysłanego przez Supabase.' : text;
        report('Błąd: ' + translated, true);
        console.error('AlgoClass auth:', err);
      } finally {
        button.disabled = false;
      }
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
