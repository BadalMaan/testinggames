import {useMemo,useState} from 'react'
import {RotateCcw,Check,Trash2} from 'lucide-react'
type Props={target:string;onSubmit:(value:string)=>void}
function graphemes(text:string){try{const parts:any[]=Array.from(new (Intl as any).Segmenter('pa',{granularity:'grapheme'}).segment(text));return parts.map(x=>x.segment)}catch{return Array.from(text)}}
export default function WordBuilderPractice({target,onSubmit}:Props){
 const source=useMemo(()=>graphemes(target),[target])
 const [tiles,setTiles]=useState(()=>source.map((value,index)=>({value,index})).sort(()=>Math.random()-.5))
 const [selected,setSelected]=useState<number[]>([])
 const answer=selected.map(i=>tiles.find(t=>t.index===i)?.value||'').join('')
 function choose(index:number){if(selected.includes(index))return;setSelected(a=>[...a,index])}
 function remove(index:number){setSelected(a=>a.filter((_,i)=>i!==index))}
 function reset(){setSelected([]);setTiles(source.map((value,index)=>({value,index})).sort(()=>Math.random()-.5))}
 return <div className="word-builder"><div className="word-builder-label">Tap or drag the letter tiles to build the Punjabi word</div><div className="tile-bank" onDragOver={e=>e.preventDefault()}>{tiles.filter(t=>!selected.includes(t.index)).map(t=><button draggable key={t.index} className="letter-tile" onClick={()=>choose(t.index)} onDragStart={e=>e.dataTransfer.setData('tile',String(t.index))}>{t.value}</button>)}</div><div className="built-word" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const id=Number(e.dataTransfer.getData('tile'));if(Number.isFinite(id))choose(id)}}>{selected.length?selected.map((id,i)=><button key={`${id}-${i}`} className="built-tile" onClick={()=>remove(i)} title="Tap to remove">{tiles.find(t=>t.index===id)?.value}</button>):<span className="muted">Your word will appear here…</span>}</div><div className="word-builder-actions"><button className="secondary-btn" onClick={reset}><RotateCcw size={14}/> Reset</button><button className="secondary-btn" onClick={()=>setSelected([])}><Trash2 size={14}/> Clear</button><button className="primary-btn" disabled={!selected.length} onClick={()=>onSubmit(answer)}><Check size={15}/> Submit word</button></div></div>
}
