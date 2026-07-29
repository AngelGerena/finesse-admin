import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, CheckSquare, Square, Trash2 } from 'lucide-react'

interface Checklist { id:string; title:string; project_id:string|null; items:{text:string;done:boolean}[]; status:string; created_at:string }
interface Opt { id:string; project_name:string }

export default function Checklists() {
  const [lists,setLists]=useState<Checklist[]>([]); const [projects,setProjects]=useState<Opt[]>([])
  const [loading,setLoading]=useState(true); const [modal,setModal]=useState(false); const [saving,setSaving]=useState(false)
  const [form,setForm]=useState({title:'',project_id:null as string|null,items:[{text:'',done:false}]})

  async function load(){
    setLoading(true)
    const [{data:cl},{data:pr}]=await Promise.all([supabase.from('checklists').select('*').neq('status','archived').order('created_at',{ascending:false}),supabase.from('projects').select('id,project_name').is('deleted_at',null)])
    if(cl) setLists(cl); if(pr) setProjects(pr); setLoading(false)
  }
  useEffect(()=>{load()},[])

  async function toggleItem(listId:string,idx:number){
    const list=lists.find(l=>l.id===listId); if(!list) return
    const items=[...list.items]; items[idx]={...items[idx],done:!items[idx].done}
    const allDone=items.every(i=>i.done)
    await supabase.from('checklists').update({items,status:allDone?'completed':'active',updated_at:new Date().toISOString()}).eq('id',listId)
    load()
  }

  async function save(){
    setSaving(true)
    const items=form.items.filter(i=>i.text.trim())
    await supabase.from('checklists').insert({title:form.title,project_id:form.project_id||null,items,status:'active'})
    setSaving(false);setModal(false);setForm({title:'',project_id:null,items:[{text:'',done:false}]});load()
  }

  async function archive(id:string){await supabase.from('checklists').update({status:'archived'}).eq('id',id);load()}
  function addItem(){setForm(p=>({...p,items:[...p.items,{text:'',done:false}]}))}
  function updateItemText(idx:number,text:string){const items=[...form.items];items[idx]={...items[idx],text};setForm(p=>({...p,items}))}
  function removeFormItem(idx:number){setForm(p=>({...p,items:p.items.filter((_,i)=>i!==idx)}))}
  function projectName(id:string|null){return projects.find(p=>p.id===id)?.project_name||''}
  function pct(items:{done:boolean}[]){if(!items.length) return 0; return Math.round(items.filter(i=>i.done).length/items.length*100)}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Checklists</h2>
        <button onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>New Checklist</button>
      </div>

      {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
      lists.length===0?<div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',padding:40,textAlign:'center',color:'var(--muted)'}}>No checklists yet.</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
        {lists.map(list=>(<div key={list.id} style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:600,fontSize:15}}>{list.title}</div>
              {list.project_id&&<div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{projectName(list.project_id)}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:11,color:list.status==='completed'?'var(--status-success)':'var(--muted)',fontWeight:600}}>{pct(list.items)}%</span>
              <div style={{width:40,height:4,borderRadius:2,background:'var(--line)'}}><div style={{width:`${pct(list.items)}%`,height:'100%',background:list.status==='completed'?'var(--status-success)':'var(--accent)',borderRadius:2,transition:'width 0.3s'}}/></div>
              <button onClick={()=>archive(list.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}} title="Archive"><Trash2 size={14}/></button>
            </div>
          </div>
          <div style={{padding:'8px 12px'}}>
            {list.items.map((item,idx)=>(<div key={idx} onClick={()=>toggleItem(list.id,idx)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px',cursor:'pointer',borderRadius:6,transition:'background 0.15s'}} onMouseOver={e=>(e.currentTarget.style.background='#FAFAF8')} onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
              {item.done?<CheckSquare size={18} color="var(--status-success)"/>:<Square size={18} color="var(--muted)"/>}
              <span style={{fontSize:14,color:item.done?'var(--muted)':'var(--text)',textDecoration:item.done?'line-through':'none'}}>{item.text}</span>
            </div>))}
          </div>
        </div>))}
      </div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:500,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>New Checklist</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Title</label><input style={IS} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Checklist name"/></div>
            <div style={{marginBottom:16}}><label style={LS}>Project (optional)</label><select style={IS} value={form.project_id||''} onChange={e=>setForm(p=>({...p,project_id:e.target.value||null}))}><option value="">No project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}</select></div>
            <div style={{marginBottom:16}}><label style={LS}>Items</label>
              {form.items.map((item,idx)=>(<div key={idx} style={{display:'flex',gap:8,marginBottom:8}}>
                <input style={{...IS,flex:1}} value={item.text} onChange={e=>updateItemText(idx,e.target.value)} placeholder={`Item ${idx+1}`}/>
                {form.items.length>1&&<button onClick={()=>removeFormItem(idx)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><X size={16}/></button>}
              </div>))}
              <button onClick={addItem} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'var(--font-ui)'}}>+ Add Item</button>
            </div>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.title} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.title?0.7:1}}>{saving?'Saving...':'Create Checklist'}</button></div>
        </div>
      </div>}
    </div>
  )
}
