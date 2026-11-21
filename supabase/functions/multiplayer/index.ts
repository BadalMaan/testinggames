import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
import {corsHeaders,json} from '../_shared/cors.ts'
const code=()=>crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase()
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
 try{
  const auth=req.headers.get('Authorization');if(!auth)return json({error:'Unauthorized'},401)
  const userClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}})
  const {data:{user}}=await userClient.auth.getUser();if(!user)return json({error:'Unauthorized'},401)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const {data:student}=await admin.from('students').select('is_blocked').eq('id',user.id).maybeSingle()
  if(!student||student.is_blocked)return json({error:'This student account is blocked or unavailable.'},403)
  const {action,game_id,room_code,max_players,room_id,is_ready}=await req.json()
  if(action==='create'){
   if(typeof game_id!=='string')return json({error:'game_id required'},400)
   const {data:activeGame}=await admin.from('games').select('id').eq('id',game_id).eq('is_active',true).maybeSingle()
   if(!activeGame)return json({error:'Selected multiplayer game is unavailable.'},404)
   const roomCode=code()
   const {data:room,error}=await admin.from('multiplayer_rooms').insert({room_code:roomCode,host_student_id:user.id,game_id,max_players:Math.max(2,Math.min(8,max_players||2))}).select().single()
   if(error)throw error
   await admin.from('multiplayer_players').insert({room_id:room.id,student_id:user.id,is_ready:true})
   return json({room_id:room.id,room_code:room.room_code})
  }
  if(action==='join'){
   const {data:room}=await admin.from('multiplayer_rooms').select('*').eq('room_code',String(room_code||'').toUpperCase()).eq('status','waiting').gt('expires_at',new Date().toISOString()).maybeSingle()
   if(!room)return json({error:'Room not found or no longer accepting players'},404)
   const {count}=await admin.from('multiplayer_players').select('id',{count:'exact',head:true}).eq('room_id',room.id)
   if((count||0)>=room.max_players)return json({error:'Room is full'},409)
   const {error}=await admin.from('multiplayer_players').upsert({room_id:room.id,student_id:user.id},{onConflict:'room_id,student_id'})
   if(error)throw error
   return json({room_id:room.id,room_code:room.room_code})
  }
  if(action==='ready'){
   const {error}=await admin.from('multiplayer_players').update({is_ready:Boolean(is_ready)}).eq('room_id',room_id).eq('student_id',user.id)
   if(error)throw error;return json({ok:true})
  }
  if(action==='start'){
   const {data:room}=await admin.from('multiplayer_rooms').select('*').eq('id',room_id).eq('host_student_id',user.id).eq('status','waiting').single()
   if(!room)return json({error:'Only the room host can start this room'},403)
   const {data:players}=await admin.from('multiplayer_players').select('student_id,is_ready').eq('room_id',room_id)
   if(!players||players.length<2||players.some((p:any)=>!p.is_ready))return json({error:'At least two players must be ready'},409)
   const {data:qs}=await admin.from('questions').select('id').eq('game_id',room.game_id).eq('content_status','approved').limit(10)
   if(!qs?.length)return json({error:'No approved questions for this game'},409)
   const order=qs.sort(()=>Math.random()-.5).map((q:any)=>q.id)
   const {data:session,error}=await admin.from('multiplayer_sessions').insert({room_id,game_id:room.game_id,question_order:order,started_at:new Date().toISOString()}).select().single()
   if(error)throw error
   await admin.from('multiplayer_rooms').update({status:'active'}).eq('id',room_id)
   return json({session_id:session.id,question_order:order})
  }

  if(action==='question'){
   const {data:session}=await admin.from('multiplayer_sessions').select('*').eq('id',session_id).single()
   if(!session||session.ended_at)return json({error:'Session is not active'},404)
   const {data:member}=await admin.from('multiplayer_players').select('id').eq('room_id',session.room_id).eq('student_id',user.id).maybeSingle()
   if(!member)return json({error:'Not a room participant'},403)
   const qid=session.question_order[session.current_question]
   const {data:q}=await admin.from('questions').select('id,prompt,prompt_language,answer_options(id,option_text,sort_order)').eq('id',qid).eq('content_status','approved').single()
   if(!q)return json({error:'Question unavailable'},404)
   return json({question:{id:q.id,prompt:q.prompt,prompt_language:q.prompt_language,options:(q.answer_options||[]).sort(()=>Math.random()-.5).map((o:any)=>({id:o.id,text:o.option_text}))},index:session.current_question,total:session.question_order.length})
  }
  if(action==='advance'){
   const {data:session}=await admin.from('multiplayer_sessions').select('*').eq('id',session_id).single()
   if(!session||session.ended_at)return json({error:'Session is not active'},404)
   const {data:room}=await admin.from('multiplayer_rooms').select('*').eq('id',session.room_id).single()
   if(!room||room.host_student_id!==user.id)return json({error:'Only the host can advance the round'},403)
   const {count:players}=await admin.from('multiplayer_players').select('id',{count:'exact',head:true}).eq('room_id',session.room_id)
   const qid=session.question_order[session.current_question]
   const {count:answered}=await admin.from('multiplayer_answers').select('id',{count:'exact',head:true}).eq('session_id',session.id).eq('question_id',qid)
   if((answered||0)<(players||0))return json({error:'Wait until every player has answered.'},409)
   const next=session.current_question+1
   if(next>=session.question_order.length){
    await admin.from('multiplayer_sessions').update({ended_at:new Date().toISOString()}).eq('id',session.id)
    await admin.from('multiplayer_rooms').update({status:'completed'}).eq('id',room.id)
    const {data:scoreboard}=await admin.from('multiplayer_players').select('student_id,score').eq('room_id',room.id).order('score',{ascending:false})
    let winner_id=null
    if(scoreboard?.length&&scoreboard.length>1&&scoreboard[0].score>scoreboard[1].score){
     winner_id=scoreboard[0].student_id
     const {data:profile}=await admin.from('student_profiles').select('total_xp').eq('student_id',winner_id).single()
     const newXp=(profile?.total_xp||0)+30
     await admin.from('student_profiles').update({total_xp:newXp,current_level:newXp>=6000?7:newXp>=4000?6:newXp>=2500?5:newXp>=1500?4:newXp>=800?3:newXp>=300?2:1}).eq('student_id',winner_id)
     await admin.from('point_transactions').insert({student_id:winner_id,points:30,reason:`multiplayer-victory-${room.id}`})
     const {data:lb}=await admin.from('leaderboards').select('id').eq('scope','global').eq('student_id',winner_id).maybeSingle()
     if(lb)await admin.from('leaderboards').update({points:newXp,updated_at:new Date().toISOString()}).eq('id',lb.id)
     else await admin.from('leaderboards').insert({scope:'global',student_id:winner_id,points:newXp})
    }
    return json({completed:true,scoreboard,winner_id,bonus_xp:winner_id?30:0})
   }
   await admin.from('multiplayer_sessions').update({current_question:next}).eq('id',session.id)
   return json({completed:false,index:next})
  }
  if(action==='leave'){
   await admin.from('multiplayer_players').delete().eq('room_id',room_id).eq('student_id',user.id)
   return json({ok:true})
  }
  return json({error:'Unsupported action'},400)
 }catch(e){return json({error:e instanceof Error?e.message:String(e)},500)}
})
