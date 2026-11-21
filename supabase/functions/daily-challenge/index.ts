import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await userClient.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'This student account is blocked or unavailable.'},403)
  const {action,challenge_id,session_id}=await req.json().catch(()=>({action:'get'}))
  if(action==='get'){
   const today=new Date().toISOString().slice(0,10)
   const {data}=await admin.from('daily_challenges').select('*,games(title,description)').eq('challenge_date',today).eq('is_active',true).maybeSingle()
   if(!data)return json({challenge:null})
   const {data:done}=await admin.from('daily_challenge_completions').select('id').eq('challenge_id',data.id).eq('student_id',user.id).maybeSingle()
   return json({challenge:data,completed:Boolean(done)})
  }
  if(action==='complete'){
   const {data:challenge}=await admin.from('daily_challenges').select('*').eq('id',challenge_id).eq('is_active',true).single()
   const {data:history}=await admin.from('game_history').select('id,game_id,session_id').eq('session_id',session_id).eq('student_id',user.id).single()
   if(!challenge||!history||history.game_id!==challenge.game_id)return json({error:'Complete the daily challenge game first.'},409)
   const {error}=await admin.from('daily_challenge_completions').insert({challenge_id,student_id:user.id,session_id,xp_awarded:challenge.bonus_xp})
   if(error)return json({error:error.code==='23505'?'Daily challenge already claimed.':error.message},409)
   await admin.from('point_transactions').insert({student_id:user.id,session_id,points:challenge.bonus_xp,reason:'daily_challenge_bonus'})
   const {data:profile}=await admin.from('student_profiles').select('total_xp').eq('student_id',user.id).single()
   const newXp=(profile?.total_xp||0)+challenge.bonus_xp
   await admin.from('student_profiles').update({total_xp:newXp}).eq('student_id',user.id)
   const {data:lb}=await admin.from('leaderboards').select('id').eq('scope','global').eq('student_id',user.id).maybeSingle()
   if(lb)await admin.from('leaderboards').update({points:newXp,updated_at:new Date().toISOString()}).eq('id',lb.id)
   else await admin.from('leaderboards').insert({scope:'global',student_id:user.id,points:newXp})
   return json({ok:true,xp_awarded:challenge.bonus_xp})
  }
  return json({error:'Unsupported action'},400)
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
