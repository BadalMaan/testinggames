import {useState} from 'react'
import {supabase} from '../supabase'
import {Upload,Copy,Check} from 'lucide-react'
export default function AssetUploader(){
 const [file,setFile]=useState<File|null>(null),[url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 async function upload(){if(!supabase||!file)return;setBusy(true);setError('');setUrl('');const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`approved-assets/${Date.now()}-${safe}`;const {error}=await supabase.storage.from('game-assets').upload(path,file,{contentType:file.type,upsert:false});setBusy(false);if(error){setError(error.message);return}const {data}=supabase.storage.from('game-assets').getPublicUrl(path);setUrl(data.publicUrl)}
 return <div className="asset-uploader"><div><b>Game image / audio assets</b><p className="muted">Upload reviewed images or recorded Punjabi audio to the public game-assets bucket. Admin permission is required.</p></div><input type="file" accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/wav,audio/ogg" onChange={e=>setFile(e.target.files?.[0]||null)}/><button className="secondary-btn" disabled={!file||busy||!supabase} onClick={upload}><Upload size={14}/>{busy?'Uploading…':'Upload asset'}</button>{error&&<p className="feedback bad">{error}</p>}{url&&<div className="asset-url"><a href={url} target="_blank" rel="noreferrer">{url}</a><button className="tiny-action" onClick={()=>navigator.clipboard?.writeText(url)}><Copy size={12}/></button></div>}</div>
}
