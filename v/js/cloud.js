(()=>{'use strict';
let client=null, init=null;
const cfg=window.AlgoSupabaseConfig||{};
const configured=()=>/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test((cfg.url||'').trim())&&!!String(cfg.publishableKey||'').trim();
async function connect(){if(!configured())return null;if(client)return client;if(!init)init=(async()=>{const lib=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');client=lib.createClient(cfg.url.trim(),cfg.publishableKey.trim(),{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client})();return init}
async function session(){const db=await connect();if(!db)return null;const {data,error}=await db.auth.getUser();if(error)return null;return data.user}
async function me(){const u=await session();if(!u)return null;const db=await connect();const {data,error}=await db.from('profiles').select('id,display_name,role').eq('id',u.id).single();if(error)throw error;return {...data,email:u.email}}
const safe=e=>e?.message||'Nie udało się wykonać operacji.';
window.AlgoCloud={connect,session,me,configured,safe};
})();