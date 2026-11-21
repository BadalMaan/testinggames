import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await userClient.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const {session_id,question_id,option_id,response_ms}=await req.json()
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'This student account is blocked or unavailable.'},403)
  const {data:session}=await admin.from('multiplayer_sessions').select('id,room_id,question_order,ended_at').eq('id',session_id).single()
  if(!session||session.ended_at||session.question_order?.[session.current_question]!==question_id)return json({error:'Invalid multiplayer session'},403)
  const {data:player}=await admin.from('multiplayer_players').select('id').eq('room_id',session.room_id).eq('student_id',user.id).maybeSingle()
  if(!player)return json({error:'Not a room participant'},403)
  const {data:q}=await admin.from('questions').select('id,answer,answer_options(id,option_text)').eq('id',question_id).eq('content_status','approved').single()
  if(!q)return json({error:'Question not found'},404)
  const chosen=q.answer_options?.find((o:any)=>o.id===option_id)
  const correct=Boolean(chosen&&chosen.option_text===q.answer)
  const {error}=await admin.from('multiplayer_answers').insert({session_id,student_id:user.id,question_id,is_correct:correct,response_ms:Math.max(0,Math.min(60000,Number(response_ms)||0))})
  if(error)return json({error:error.message},409)
  if(correct){
   const {data:pl}=await admin.from('multiplayer_players').select('score').eq('id',player.id).single()
   await admin.from('multiplayer_players').update({score:(pl?.score||0)+10}).eq('id',player.id)
  }
  return json({correct,score_delta:correct?10:0})
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
