import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await client.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const {session_id,time_seconds}=await req.json()
  if(typeof session_id!=='string')return json({error:'session_id required'},400)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'This student account is blocked or unavailable.'},403)
  const {data:session}=await admin.from('game_sessions').select('id,status,student_id,game_id,question_order').eq('id',session_id).single()
  if(!session||session.student_id!==user.id||session.status!=='started')return json({error:'Invalid game session'},403)
  const {data:answers,error}=await admin.from('game_session_answers').select('question_id,is_correct,response_ms').eq('session_id',session_id).eq('student_id',user.id)
  if(error)throw error
  const expected=(session.question_order||[]) as string[]
  if(!answers||answers.length!==expected.length)return json({error:`Answer all ${expected.length} questions before finishing.`},409)
  const correct=answers.filter((a:any)=>a.is_correct).length
  const incorrect=answers.length-correct
  const fast=answers.filter((a:any)=>a.is_correct&&a.response_ms<=5000).length
  const xp=correct*10+fast*5+(correct===answers.length&&answers.length>0?25:0)
  const {data:result,error:rpcError}=await client.rpc('finalize_game_session',{p_session_id:session_id,p_student_id:user.id,p_game_id:session.game_id,p_correct:correct,p_incorrect:incorrect,p_time_seconds:Math.max(0,Math.min(3600,Number(time_seconds)||0)),p_xp:xp})
  if(rpcError)throw rpcError
  return json({correct,incorrect,xp,accuracy:Math.round(correct/answers.length*100),result})
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
