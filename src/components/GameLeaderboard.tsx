import {useEffect,useState} from 'react'
import {supabase} from '../supabase'
import {Trophy,RefreshCw} from 'lucide-react'
export default function GameLeaderboard({gameId}:{gameId:string}){
 const [rows,setRows]=useState<any[]>([]),[error,setError]=useState('')
 useEffect(()=>{let alive=true;const load=async()=>{if(!supabase){setError('Connect Supabase and sign in to view live rankings.');return}const {data:{session}}=await supabase.auth.getSession();if(!session){setError('Sign in to view the live game leaderboard.');return}const {data,error}=await supabase.rpc('get_game_leaderboard',{p_game_id:gameId,p_limit:10});if(error){setError(error.message);return}if(alive)setRows(data||[])};load();return()=>{alive=false}},[gameId])
 return <div className="panel game-leaderboard"><div className="panel-title"><div><div className="eyebrow">TOP PLAYERS</div><h3><Trophy size={16}/> Game leaderboard</h3></div><button className="text-btn" onClick={()=>{setError('');setRows([]);}}><RefreshCw size={14}/></button></div>{error?<p className="muted">{error}</p>:rows.map((r,i)=><div className="leader-row" key={r.student_id}><span className={`rank rank-${i+1}`}>{r.player_rank}</span><span className="leader-name"><b>{r.display_name}</b></span><strong>{r.points} <small>XP</small></strong></div>)}</div>
}
