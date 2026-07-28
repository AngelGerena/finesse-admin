import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Search, X, Edit, Trash2 } from 'lucide-react'

interface Project {
  id: string; client_id: string|null; project_name: string; project_type: string|null
  status: string; start_date: string|null; due_date: string|null; completed_date: string|null
  budget: number|null; amount_paid: number|null; description: string|null; notes: string|null
  created_at: string; updated_at: string
}
interface ClientOption { id: string; business_name: string }

const STATUSES = ['planning','in_progress','review','completed','on_hold','cancelled']
const TYPES = ['website','saas','photography','branding','retainer','ministry','other']
const SC: Record<string,{bg:string;fg:string}> = {
  planning:{bg:'#EBF8FF',fg:'#2B6CB0'}, in_progress:{bg:'#FFF8E1',fg:'#B8860B'},
  review:{bg:'rgba(197,164,75,0.1)',fg:'#C5A44B'}, completed:{bg:'#E8F5EC',fg:'#2D8A54'},
  on_hold:{bg:'#F5F5F5',fg:'#666'}, cancelled:{bg:'#FFF5F5',fg:'#C53030'}
}
const EMPTY = {client_id:null as string|null,project_name:'',project_type:null as string|null,status:'planning',start_date:null as string|null,due_date:null as string|null,completed_date:null as string|null,budget:null as number|null,amount_paid:null as number|null,description:null as string|null,notes:null as string|null}

export default function Projects() {
  const [projects,setProjects]=useState<Project[]>([]); const [clients,setClients]=useState<ClientOption[]>([])
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState(''); const [filter,setFilter]=useState('all')
  const [modal,setModal]=useState(false); const [mode,setMode]=useState<'add'|'edit'|'view'>('add')
  const [form,setForm]=useState<typeof EMPTY & {id?:string}>(EMPTY)
  const [saving,setSaving]=useState(false); const [delId,setDelId]=useState<string|null>(null)

  async function load(){
    setLoading(true)
    let q=supabase.from('projects').select('*').is('deleted_at',null).order('created_at',{ascending:false})
    if(filter!=='all') q=q.eq('status',filter)
    const [{data:projData},{data:clientData}]=await Promise.all([q,supabase.from('clients').select('id,business_name').is('deleted_at',null).order('business_name')])
    if(projData) setProjects(projData); if(clientData) setClients(clientData)
    setLoading(false)
  }
  useEffect(()=>{load()},[filter])

  const filtered=projects.filter(p=>{if(!search) return true; const q=search.toLowerCase(); return p.project_name.toLowerCase().includes(q)||(p.description||'').toLowerCase().includes(q)})

  function clientName(id:string|null){return clients.find(c=>c.id===id)?.business_name||'—'}
  function openAdd(){setForm({...EMPTY});setMode('add');setModal(true)}
  function openEdit(p:Project){setForm({...p});setMode('edit');setModal(true)}
  function openView(p:Project){setForm({...p});setMode('view');setModal(true)}

  async function save(){
    setSaving(true)
    const p={client_id:form.client_id||null,project_name:form.project_name,project_type:form.project_type||null,status:form.status,start_date:form.start_date||null,due_date:form.due_date||null,completed_date:form.completed_date||null,budget:form.budget||null,amount_paid:form.amount_paid||null,description:form.description||null,notes:form.notes||null,updated_at:new Date().toISOString()}
    if(mode==='edit'&&form.id) await supabase.from('projects').update(p).eq('id',form.id)
    else await supabase.from('projects').insert(p)
    setSaving(false);setModal(false);load()
  }

  async function del(id:string){await supabase.from('projects').update({deleted_at:new Date().toISOString()}).eq('id',id);setDelId(null);load()}
  function set(k:string,v:string|number|null){setForm(p=>({...p,[k]:v}))}
  function fmtDate(d:string){return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
  function pctPaid(b:number|null,a:number|null){if(!b||b===0) return 0; return Math.min(100,Math.round(((a||0)/b)*100))}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Projects</h2><p style={{fontSize:13,color:'var(--muted)',marginTop:4}}>{filtered.length} project{filtered.length!==1?'s':''}</p></div>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>New Project</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['all',...STATUSES].map(s=>(<button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer',border:'1px solid',textTransform:'capitalize',background:filter===s?(s==='all'?'var(--brand)':SC[s]?.bg||'#f5f5f5'):'transparent',color:filter===s?(s==='all'?'var(--accent)':SC[s]?.fg||'#666'):'var(--muted)',borderColor:filter===s?(s==='all'?'var(--brand)':SC[s]?.fg||'#ccc'):'var(--line)'}}>{s==='all'?`All (${projects.length})`:s.replace('_',' ')}</button>))}
      </div>

      <div style={{position:'relative',marginBottom:20}}><Search size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}/><input placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,paddingLeft:38,background:'#fff',width:'100%'}}/></div>

      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
        filtered.length===0?<div style={{padding:40,textAlign:'center'}}><div style={{color:'var(--muted)',marginBottom:8}}>No projects found.</div><button onClick={openAdd} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:14,fontFamily:'var(--font-ui)'}}>Create your first project</button></div>:
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead><tr style={{borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>
            {['Project','Client','Type','Status','Budget','Paid','Due',''].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>{h}</th>))}
          </tr></thead>
          <tbody>{filtered.map(p=>(<tr key={p.id} style={{borderBottom:'1px solid var(--line)',cursor:'pointer'}} onClick={()=>openView(p)}>
            <td style={{padding:'14px 16px',fontWeight:600,color:'var(--text)'}}>{p.project_name}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{clientName(p.client_id)}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)',textTransform:'capitalize'}}>{p.project_type||'—'}</td>
            <td style={{padding:'14px 16px'}}><span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:600,textTransform:'capitalize',background:SC[p.status]?.bg||'#f5f5f5',color:SC[p.status]?.fg||'#666'}}>{p.status.replace('_',' ')}</span></td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{p.budget?`$${Number(p.budget).toLocaleString()}`:'—'}</td>
            <td style={{padding:'14px 16px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:60,height:6,borderRadius:3,background:'var(--line)',overflow:'hidden'}}><div style={{width:`${pctPaid(p.budget,p.amount_paid)}%`,height:'100%',background:'var(--accent)',borderRadius:3}}/></div><span style={{fontSize:11,color:'var(--muted)'}}>{pctPaid(p.budget,p.amount_paid)}%</span></div></td>
            <td style={{padding:'14px 16px',fontSize:12,color:'var(--muted)'}}>{p.due_date?fmtDate(p.due_date):'—'}</td>
            <td style={{padding:'14px 16px'}} onClick={e=>e.stopPropagation()}><div style={{display:'flex',gap:6}}><button onClick={()=>openEdit(p)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><Edit size={16}/></button><button onClick={()=>setDelId(p.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><Trash2 size={16}/></button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>

      {delId&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDelId(null)}><div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%'}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',marginBottom:8}}>Delete Project?</h3><p style={{fontSize:14,color:'var(--muted)',marginBottom:24}}>This project will be archived.</p><div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setDelId(null)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={()=>del(delId)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'var(--status-danger)',border:'none',color:'#fff',fontFamily:'var(--font-ui)',fontWeight:600}}>Delete</button></div></div></div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 20px',overflowY:'auto'}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:600,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>{mode==='add'?'New Project':mode==='edit'?'Edit Project':'Project Details'}</h3><div style={{display:'flex',gap:8}}>{mode==='view'&&<button onClick={()=>setMode('edit')} style={{display:'flex',alignItems:'center',gap:6,background:'var(--accent-soft)',color:'var(--accent)',border:'none',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-ui)'}}><Edit size={14}/>Edit</button>}<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div></div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Project Name *</label>{mode==='view'?<div style={{fontSize:14,fontWeight:600}}>{form.project_name}</div>:<input style={IS} value={form.project_name} onChange={e=>set('project_name',e.target.value)} placeholder="Project name" required/>}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Client</label>{mode==='view'?<div style={{fontSize:14}}>{clientName(form.client_id)}</div>:<select style={IS} value={form.client_id||''} onChange={e=>set('client_id',e.target.value||null)}><option value="">No client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.business_name}</option>)}</select>}</div>
              <div><label style={LS}>Type</label>{mode==='view'?<div style={{fontSize:14,textTransform:'capitalize'}}>{form.project_type||'—'}</div>:<select style={IS} value={form.project_type||''} onChange={e=>set('project_type',e.target.value||null)}><option value="">Select type</option>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select>}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Status</label>{mode==='view'?<span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:12,fontWeight:600,textTransform:'capitalize',background:SC[form.status]?.bg||'#f5f5f5',color:SC[form.status]?.fg||'#666'}}>{form.status.replace('_',' ')}</span>:<select style={IS} value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}</select>}</div>
              <div><label style={LS}>Budget</label>{mode==='view'?<div style={{fontSize:14}}>{form.budget?`$${Number(form.budget).toLocaleString()}`:'—'}</div>:<input style={IS} type="number" min="0" step="50" value={form.budget||''} onChange={e=>set('budget',e.target.value?Number(e.target.value):null)} placeholder="$0"/>}</div>
              <div><label style={LS}>Amount Paid</label>{mode==='view'?<div style={{fontSize:14}}>{form.amount_paid?`$${Number(form.amount_paid).toLocaleString()}`:'$0'}</div>:<input style={IS} type="number" min="0" step="50" value={form.amount_paid||''} onChange={e=>set('amount_paid',e.target.value?Number(e.target.value):null)} placeholder="$0"/>}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Start Date</label>{mode==='view'?<div style={{fontSize:14}}>{form.start_date?fmtDate(form.start_date):'—'}</div>:<input style={IS} type="date" value={form.start_date||''} onChange={e=>set('start_date',e.target.value||null)}/>}</div>
              <div><label style={LS}>Due Date</label>{mode==='view'?<div style={{fontSize:14}}>{form.due_date?fmtDate(form.due_date):'—'}</div>:<input style={IS} type="date" value={form.due_date||''} onChange={e=>set('due_date',e.target.value||null)}/>}</div>
              <div><label style={LS}>Completed</label>{mode==='view'?<div style={{fontSize:14}}>{form.completed_date?fmtDate(form.completed_date):'—'}</div>:<input style={IS} type="date" value={form.completed_date||''} onChange={e=>set('completed_date',e.target.value||null)}/>}</div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Description</label>{mode==='view'?<div style={{fontSize:14,whiteSpace:'pre-wrap',lineHeight:1.7}}>{form.description||'—'}</div>:<textarea style={{...IS,minHeight:80,resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Project description..."/>}</div>
            <div style={{marginBottom:16}}><label style={LS}>Notes</label>{mode==='view'?<div style={{fontSize:14,whiteSpace:'pre-wrap',lineHeight:1.7}}>{form.notes||'No notes.'}</div>:<textarea style={{...IS,minHeight:80,resize:'vertical'}} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Internal notes..."/>}</div>
          </div>
          {mode!=='view'&&<div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.project_name} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.project_name?0.7:1}}>{saving?'Saving...':mode==='add'?'Create Project':'Save Changes'}</button></div>}
        </div>
      </div>}
    </div>
  )
}
