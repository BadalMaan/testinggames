import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await userClient.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:role}=await admin.from('admin_users').select('role').eq('user_id',user.id).maybeSingle()
  if(!role)return json({error:'Admin access required'},403)
  const body=await req.json();const action=body.action
  const allowed=['students','games','game_categories','questions','answer_options','vocabulary','matra_words','reports','seasons','leaderboards','audit_logs','score_adjustments','daily_challenges','tournaments','analytics','adjust_score']
  if(!allowed.includes(action))return json({error:'Unknown admin action'},400)
  if(action==='analytics'){
   const [students,sessions,games,questions,scores,profiles]=await Promise.all([
    admin.from('students').select('id',{count:'exact',head:true}),
    admin.from('game_sessions').select('id',{count:'exact',head:true}),
    admin.from('games').select('id,title,is_active'),
    admin.from('questions').select('id',{count:'exact',head:true}),
    admin.from('student_scores').select('accuracy,game_id,created_at,student_id').order('created_at',{ascending:false}).limit(1000),
    admin.from('student_profiles').select('display_name,total_xp,total_games,accuracy').order('total_xp',{ascending:false}).limit(10)
   ])
   const all=scores.data||[],now=Date.now(),week=all.filter((x:any)=>now-new Date(x.created_at).getTime()<7*86400000),month=all.filter((x:any)=>now-new Date(x.created_at).getTime()<30*86400000)
   const avg=all.length?all.reduce((sum:number,x:any)=>sum+Number(x.accuracy||0),0)/all.length:0
   const popularity=Object.entries(all.reduce((m:any,x:any)=>(m[x.game_id]=(m[x.game_id]||0)+1,m),{})).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5)
   return json({students:students.count||0,sessions:sessions.count||0,games:games.data||[],questions:questions.count||0,average_accuracy:Number(avg.toFixed(1)),weekly_activity:week.length,monthly_activity:month.length,popular_games:popularity,top_students:profiles.data||[]})
  }
  if(action==='students'){
   const {data,error}=await admin.from('students').select('id,student_code,display_name,is_blocked,created_at,student_profiles(total_xp,total_games,accuracy)').order('created_at',{ascending:false}).limit(500)
   if(error)throw error;return json({data})
  }
  if(action==='adjust_score'){
   if(role.role!=='owner'&&role.role!=='admin')return json({error:'Insufficient role'},403)
   const {student_id,points_delta,reason}=body.record||body
   if(typeof student_id!=='string'||!Number.isInteger(points_delta)||Math.abs(points_delta)>1000||typeof reason!=='string'||reason.trim().length<5)return json({error:'Invalid adjustment'},400)
   const {error}=await admin.from('score_adjustments').insert({student_id,admin_id:user.id,points_delta,reason:reason.trim()})
   if(error)throw error
   const {data:profile}=await admin.from('student_profiles').select('total_xp').eq('student_id',student_id).single()
   const updatedXp=Math.max(0,(profile?.total_xp||0)+points_delta)
   await admin.from('student_profiles').update({total_xp:updatedXp}).eq('student_id',student_id)
   const {data:lb}=await admin.from('leaderboards').select('id').eq('scope','global').eq('student_id',student_id).maybeSingle()
   if(lb)await admin.from('leaderboards').update({points:updatedXp,updated_at:new Date().toISOString()}).eq('id',lb.id)
   else await admin.from('leaderboards').insert({scope:'global',student_id,points:updatedXp})
   await admin.from('audit_logs').insert({actor_id:user.id,action:'score_adjustment',target_type:'student',target_id:student_id,metadata:{points_delta,reason}})
   return json({ok:true})
  }
  const table=action==='reports'?'question_reports':action
  if(body.method==='GET'){
   const {data,error}=await admin.from(table).select('*').limit(500).order(action==='leaderboards'?'updated_at':'created_at',{ascending:false})
   if(error)throw error;return json({data})
  }
  if(role.role==='teacher'&&['students','games','game_categories','seasons','leaderboards','audit_logs','score_adjustments','daily_challenges','tournaments'].includes(action))return json({error:'Insufficient role'},403)
  let saved:any=null
  if(body.method==='DELETE'){
   const {error}=await admin.from(table).delete().eq('id',body.id);if(error)throw error
  }else if(body.method==='PATCH'){
   const {data,error}=await admin.from(table).update(body.record).eq('id',body.id).select().single();if(error)throw error;saved=data
  }else{
   const {data,error}=await admin.from(table).insert(body.record).select().single();if(error)throw error;saved=data
  }
  await admin.from('audit_logs').insert({actor_id:user.id,action:`${body.method||'POST'}_${action}`,target_type:action,target_id:body.id||null,metadata:{}})
  return json({ok:true,...(saved||{})})
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
