import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await userClient.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const {session_id,question_id,option_id,response_ms,timed_out}=await req.json()
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'This student account is blocked or unavailable.'},403)
  const {data:session}=await admin.from('game_sessions').select('id,student_id,status,question_order').eq('id',session_id).single()
  if(!session||session.student_id!==user.id||session.status!=='started'||!(session.question_order||[]).includes(question_id))return json({error:'Invalid game session or question'},403)
  const {data:q}=await admin.from('questions').select('id,answer,answer_options(id,option_text)').eq('id',question_id).eq('content_status','approved').single()
  if(!q)return json({error:'Question unavailable'},404)
  const option=timed_out?null:q.answer_options?.find((o:any)=>o.id===option_id)
  if(!timed_out&&!option)return json({error:'Invalid answer option'},400)
  const isCorrect=Boolean(option&&option.option_text===q.answer)
  const {error}=await admin.from('game_session_answers').insert({session_id,student_id:user.id,question_id,option_id:timed_out?null:option_id,is_correct:isCorrect,response_ms:Math.max(0,Math.min(60000,Number(response_ms)||0))})
  if(error)return json({error:error.code==='23505'?'This question has already been answered.':error.message},409)
  return json({correct:isCorrect,feedback:isCorrect?'Correct answer!':'Not quite. Keep going!'})
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
