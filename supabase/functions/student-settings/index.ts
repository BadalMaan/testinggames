import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await client.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'Account unavailable'},403)
  const {public_display_name,public_leaderboard_opt_in,preferred_avatar}=await req.json()
  if(typeof public_leaderboard_opt_in!=='boolean')return json({error:'Leaderboard privacy choice is required'},400)
  const safeName=typeof public_display_name==='string'?public_display_name.trim().slice(0,24):''
  if(public_leaderboard_opt_in&&safeName.length<2)return json({error:'Choose a public display name of at least two characters.'},400)
  const update:any={public_leaderboard_opt_in,public_display_name:safeName||null,updated_at:new Date().toISOString()}
  if(typeof preferred_avatar==='string'&&/^[a-z0-9_-]{1,32}$/i.test(preferred_avatar))update.preferred_avatar=preferred_avatar
  const {error}=await admin.from('student_profiles').update(update).eq('student_id',user.id)
  if(error)throw error
  return json({ok:true})
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
