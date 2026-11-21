import {useEffect,useRef,useState} from 'react'
import {Mic,MicOff,Play,Square,Trash2,Volume2,AlertCircle} from 'lucide-react'
type Props={mode:'listening'|'speaking';prompt:string}
export default function VoicePractice({mode,prompt}:Props){
 const [recording,setRecording]=useState(false),[audioUrl,setAudioUrl]=useState(''),[transcript,setTranscript]=useState(''),[status,setStatus]=useState('')
 const recorder=useRef<MediaRecorder|null>(null),chunks=useRef<Blob[]>([]),stream=useRef<MediaStream|null>(null),recognition=useRef<any>(null)
 useEffect(()=>()=>{stream.current?.getTracks().forEach(t=>t.stop());if(audioUrl)URL.revokeObjectURL(audioUrl)},[audioUrl])
 function speak(){
  if(!('speechSynthesis'in window)){setStatus('Text-to-speech is not available in this browser.');return}
  const utterance=new SpeechSynthesisUtterance(prompt);utterance.lang='pa-IN'
  const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.toLowerCase().startsWith('pa'))
  if(voice)utterance.voice=voice
  else setStatus('No Punjabi voice is installed. Browser pronunciation may not be available; ask your teacher for a reviewed recording.')
  speechSynthesis.cancel();speechSynthesis.speak(utterance)
 }
 async function start(){
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true});stream.current=media;chunks.current=[]
   const rec=new MediaRecorder(media);recorder.current=rec
   rec.ondataavailable=e=>{if(e.data.size)chunks.current.push(e.data)}
   rec.onstop=()=>{const blob=new Blob(chunks.current,{type:rec.mimeType||'audio/webm'});if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioUrl(URL.createObjectURL(blob));media.getTracks().forEach(t=>t.stop());setRecording(false)}
   rec.start();setRecording(true);setStatus('Recording on this device. Audio is not uploaded.')
   const Speech=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
   if(Speech){const r=new Speech();r.lang='pa-IN';r.continuous=true;r.interimResults=true;r.onresult=(event:any)=>{let t='';for(let i=0;i<event.results.length;i++)t+=event.results[i][0].transcript+' ';setTranscript(t.trim())};r.onerror=()=>setStatus('Speech transcription is unavailable. Your audio recording can still be played back.');try{r.start();recognition.current=r}catch{}}
  }catch(e:any){setStatus(e?.message||'Microphone permission was not granted.')}
 }
 function stop(){recorder.current?.stop();try{recognition.current?.stop()}catch{}}
 function clear(){if(audioUrl)URL.revokeObjectURL(audioUrl);setAudioUrl('');setTranscript('');setStatus('Recording cleared.')}
 return <div className="voice-practice"><div className="voice-practice-head"><div className="voice-icon">{mode==='listening'?<Volume2 size={18}/>:<Mic size={18}/>}</div><div><b>{mode==='listening'?'Punjabi listening support':'Speaking practice'}</b><small>{mode==='listening'?'Listen to the prompt where a Punjabi voice is available.':'Record and listen to your own Punjabi response.'}</small></div></div>{mode==='listening'?<button className="secondary-btn" onClick={speak}><Play size={15}/> Play with browser voice</button>:<><div className="voice-controls">{!recording?<button className="primary-btn" onClick={start}><Mic size={15}/> Start recording</button>:<button className="secondary-btn" onClick={stop}><Square size={14}/> Stop recording</button>}{audioUrl&&<button className="secondary-btn" onClick={clear}><Trash2 size={14}/> Clear</button>}</div>{audioUrl&&<audio controls src={audioUrl} className="voice-audio"/>}{transcript&&<div className="transcript"><b>Browser speech-to-text (not pronunciation scoring)</b><p>{transcript}</p></div>}</>}{status&&<div className="voice-status"><AlertCircle size={14}/>{status}</div>}<p className="voice-disclaimer">Speech recognition and browser voices vary by device and language support. This is practice support, not a reliable pronunciation assessment. Your teacher can review your speaking. Recordings stay in this browser session and are not uploaded.</p></div>
}
