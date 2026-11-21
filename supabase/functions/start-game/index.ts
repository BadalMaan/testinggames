import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization'); if(!auth)return json({error:'Unauthorized'},401)
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user},error:ue}=await userClient.auth.getUser(); if(ue||!user)return json({error:'Unauthorized'},401)
  const {game_id,challenge_id}=await req.json(); if(typeof game_id!=='string')return json({error:'game_id required'},400)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'This student account is blocked or unavailable.'},403)
  const {data:game}=await admin.from('games').select('id').eq('id',game_id).eq('is_active',true).maybeSingle()
  if(!game)return json({error:'Game unavailable'},404)
  let questionQuery=admin.from('questions').select('id,prompt,prompt_language,explanation,answer_options(id,option_text,sort_order)').eq('game_id',game_id).eq('content_status','approved')
  if(challenge_id){
   const today=new Date().toISOString().slice(0,10)
   const {data:challenge}=await admin.from('daily_challenges').select('*').eq('id',challenge_id).eq('challenge_date',today).eq('is_active',true).maybeSingle()
   if(!challenge||challenge.game_id!==game_id)return json({error:'Daily challenge is unavailable.'},404)
   if((challenge.question_ids||[]).length)questionQuery=questionQuery.in('id',challenge.question_ids)
  }
  const {data:questions,error}=await questionQuery
  if(error)return json({error:error.message},500)
  if(!questions?.length)return json({error:'No teacher-approved questions are available yet.'},409)
  const shuffled=questions.sort(()=>Math.random()-.5).slice(0,Math.min(10,questions.length))
  const {data:session,error:se}=await admin.from('game_sessions').insert({student_id:user.id,game_id,question_order:shuffled.map(q=>q.id)}).select('id').single()
  if(se)return json({error:se.message},500)
  const safe=shuffled.map(q=>({id:q.id,prompt:q.prompt,prompt_language:q.prompt_language,options:(q.answer_options||[]).sort(()=>Math.random()-.5).map((o:any)=>({id:o.id,text:o.option_text}))}))
  return json({session_id:session.id,questions:safe})
 }catch(e){return json({error:String(e)},500)}
})
