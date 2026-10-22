// Supabase Edge Function: proxy to a trusted, isolated code runner (e.g. your Piston deployment).
// The runner must implement POST /api/v2/execute. Do not expose PISTON_API_KEY in the browser.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return json({ok:false,error:'Method not allowed'},405);
 try{
  const auth=req.headers.get('Authorization')||'';
  if(!auth.startsWith('Bearer '))return json({ok:false,error:'Zaloguj się.'},401);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userError}=await db.auth.getUser();if(userError||!user)return json({ok:false,error:'Sesja wygasła. Zaloguj się ponownie.'},401);
  const body=await req.json().catch(()=>null);
  if(!body||!['cpp','python'].includes(body.language)||typeof body.code!=='string'||typeof body.stdin!=='string'||body.code.length>30000||body.stdin.length>10000)return json({ok:false,error:'Nieprawidłowy język lub rozmiar danych.'},400);
  const base=Deno.env.get('PISTON_API_URL');if(!base||!/^https:\/\//.test(base))return json({ok:false,error:'Administrator nie skonfigurował serwera do uruchamiania kodu.'},503);
  const language=body.language==='cpp'?'cpp':'python';
  const version=language==='cpp'?(Deno.env.get('PISTON_CPP_VERSION')||'*'):(Deno.env.get('PISTON_PYTHON_VERSION')||'*');
  const payload={language,version,files:[{name:language==='cpp'?'main.cpp':'main.py',content:body.code}],stdin:body.stdin,run_timeout:3000,compile_timeout:10000,run_memory_limit:128*1024*1024};
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
  let res:Response;
  try{res=await fetch(base.replace(/\/$/,'')+'/api/v2/execute',{method:'POST',headers:{'Content-Type':'application/json',...(Deno.env.get('PISTON_API_KEY')?{'Authorization':Deno.env.get('PISTON_API_KEY')!}:{})},body:JSON.stringify(payload),signal:controller.signal})}finally{clearTimeout(timeout)}
  if(!res.ok)return json({ok:false,error:'Serwer uruchamiania kodu jest niedostępny ('+res.status+').'},502);
  const data=await res.json();const run=data.run||{};const compile=data.compile||{};
  return json({ok:true,stdout:String(run.stdout||'').slice(0,20000),stderr:String(run.stderr||'').slice(0,20000),compile_output:String(compile.stderr||compile.output||'').slice(0,20000),exit_code:run.code??compile.code??null});
 }catch(e){return json({ok:false,error:'Uruchomienie nie powiodło się. '+(e instanceof Error?e.message:'')},500)}
});
