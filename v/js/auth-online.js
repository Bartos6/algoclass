document.addEventListener('DOMContentLoaded',()=>{ 'use strict';
const $=id=>document.getElementById(id),form=$('loginForm')||$('registerForm')||$('resetForm');if(!form)return;
const action=form.id, msg=$('loginMessage')||$('registerMessage')||$('resetMessage');
const show=(value)=>{msg.textContent=value;msg.className='form-message info'};
if(!window.AlgoCloud?.configured()){show('Połączenie nieaktywne. Skonfiguruj js/supabase-config.js zgodnie z instrukcją KROK-9.md.');return}
if(action==='loginForm'||action==='resetForm'){const old=form.cloneNode(true);form.replaceWith(old);old.addEventListener('submit',submit)}else{form.addEventListener('submit',e=>{e.stopImmediatePropagation();submit(e)},true)}
async function submit(e){e.preventDefault();const current=e.currentTarget,button=current.querySelector('[type=submit]');button.disabled=true;show('Łączenie z serwerem…');try{const db=await AlgoCloud.connect();const email=current.querySelector('#email').value.trim(),password=current.querySelector('#password')?.value;
if(action==='loginForm'){const {error}=await db.auth.signInWithPassword({email,password});if(error)throw error;const profile=await AlgoCloud.me();location.href=profile?.role==='teacher'?'teacher.html':'student.html'}
else if(action==='registerForm'){if(current.querySelector('#password2').value!==password)throw Error('Hasła nie są identyczne.');if(password.length<8)throw Error('Hasło powinno mieć przynajmniej 8 znaków.');const {error,data}=await db.auth.signUp({email,password,options:{emailRedirectTo:new URL('index.html',location.href).href}});if(error)throw error;show(data.session?'Konto utworzone. Możesz się zalogować.':'Sprawdź e-mail i potwierdź rejestrację, a następnie zaloguj się.')}
else{const redirectTo=new URL('new-password.html',location.href).href;const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo});if(error)throw error;show('Jeśli adres istnieje w systemie, otrzymasz wiadomość z linkiem do zmiany hasła.')}
}catch(err){show('Błąd: '+(err?.message||'Niepowodzenie.'))}finally{button.disabled=false}}
});