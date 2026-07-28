import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Search, X, Edit, Trash2, ExternalLink } from 'lucide-react'

interface Client {
  id: string; business_name: string; contact_first_name: string|null; contact_last_name: string|null
  email: string|null; phone: string|null; website: string|null; address: string|null
  status: string; notes: string|null; lead_id: string|null; created_at: string; updated_at: string
}

const STATUSES = ['active','inactive','prospect']
const SC: Record<string,{bg:string;fg:string}> = {
  active:{bg:'#E8F5EC',fg:'#2D8A54'}, inactive:{bg:'#FFF5F5',fg:'#C53030'}, prospect:{bg:'#FFF8E1',fg:'#B8860B'}
}
const EMPTY = {business_name:'',contact_first_name:null as string|null,contact_last_name:null as string|null,email:null as string|null,phone:null as string|null,website:null as string|null,address:null as string|null,status:'active',notes:null as string|null}

export default function Clients() {
  const [clients,setClients]=useState<Client[]>([]); const [loading,setLoading]=useState(true)
  const [search,setSearch]=useState(''); const [filter,setFilter]=useState('all')
  const [modal,setModal]=useState(false); const [mode,setMode]=useState<'add'|'edit'|'view'>('add')
  const [form,setForm]=useState<typeof EMPTY & {id?:string}>(EMPTY)
  const [saving,setSaving]=useState(false); const [delId,setDelId]=useState<string|null>(null)
  const [projCounts,setProjCounts]=useState<Record<string,number>>({})

  async function load(){
    setLoading(true)
    let q=supabase.from('clients').select('*').is('deleted_at',null).order('created_at',{ascending:false})
    if(filter!=='all') q=q.eq('status',filter)
    const {data}=await q; if(data) setClients(data)
    const {data:projs}=await supabase.from('projects').select('client_id').is('deleted_at',null)
    if(projs){const counts:Record<string,number>={}; projs.forEach(p=>{if(p.client_id){counts[p.client_id]=(counts[p.client_id]||0)+1}}); setProjCounts(counts)}
    setLoading(false)
  }
  useEffect(()=>{load()},[filter])

  const filtered=clients.filter(c=>{
    if(!search) return true; const q=search.toLowerCase()
    return [c.business_name,c.contact_first_name,c.contact_last_name,c.email,c.phone].some(f=>(f||'').toLowerCase().includes(q))
  })

  function openAdd(){setForm({...EMPTY});setMode('add');setModal(true)}
  function openEdit(c:Client){setForm({...c});setMode('edit');setModal(true)}
  function openView(c:Client){setForm({...c});setMode('view');setModal(true)}

  async function save(){
    setSaving(true)
    const p={business_name:form.business_name,contact_first_name:form.contact_first_name||null,contact_last_name:form.contact_last_name||null,email:form.email||null,phone:form.phone||null,website:form.website||null,address:form.address||null,status:form.status,notes:form.notes||null,updated_at:new Date().toISOString()}
    if(mode==='edit'&&form.id) await supabase.from('clients').update(p).eq('id',form.id)
    else await supabase.from('clients').insert(p)
    setSaving(false);setModal(false);load()
  }

  async function del(id:string){
    await supabase.from('clients').update({deleted_at:new Date().toISOString()}).eq('id',id)
    setDelId(null);load()
  }

  function set(k:string,v:string|null){setForm(p=>({...p,[k]:v}))}
  function fmtDate(d:string){return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Clients</h2>
          <p style={{fontSize:13,color:'var(--muted)',marginTop:4}}>{filtered.length} client{filtered.length!==1?'s':''}</p>
        </div>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>New Client</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['all',...STATUSES].map(s=>(<button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer',border:'1px solid',textTransform:'capitalize',background:filter===s?(s==='all'?'var(--brand)':SC[s]?.bg||'#f5f5f5'):'transparent',color:filter===s?(s==='all'?'var(--accent)':SC[s]?.fg||'#666'):'var(--muted)',borderColor:filter===s?(s==='all'?'var(--brand)':SC[s]?.fg||'#ccc'):'var(--line)'}}>{s==='all'?`All (${clients.length})`:s}</button>))}
      </div>

      <div style={{position:'relative',marginBottom:20}}>
        <Search size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}/>
        <input placeholder="Search by business, contact name, email, or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,paddingLeft:38,background:'#fff',width:'100%'}}/>
      </div>

      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
        filtered.length===0?<div style={{padding:40,textAlign:'center'}}><div style={{color:'var(--muted)',marginBottom:8}}>No clients found.</div><button onClick={openAdd} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:14,fontFamily:'var(--font-ui)'}}>Add your first client</button></div>:
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead><tr style={{borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>
              {['Business','Contact','Email','Phone','Status','Projects','Since',''].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>{h}</th>))}
            </tr></thead>
            <tbody>{filtered.map(c=>(<tr key={c.id} style={{borderBottom:'1px solid var(--line)',cursor:'pointer'}} onClick={()=>openView(c)}>
              <td style={{padding:'14px 16px',fontWeight:600,color:'var(--text)'}}>{c.business_name}</td>
              <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{[c.contact_first_name,c.contact_last_name].filter(Boolean).join(' ')||'—'}</td>
              <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{c.email||'—'}</td>
              <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{c.phone||'—'}</td>
              <td style={{padding:'14px 16px'}}><span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:600,textTransform:'capitalize',background:SC[c.status]?.bg||'#f5f5f5',color:SC[c.status]?.fg||'#666'}}>{c.status}</span></td>
              <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{projCounts[c.id]||0}</td>
              <td style={{padding:'14px 16px',fontSize:12,color:'var(--muted)'}}>{fmtDate(c.created_at)}</td>
              <td style={{padding:'14px 16px'}} onClick={e=>e.stopPropagation()}><div style={{display:'flex',gap:6}}>
                <button onClick={()=>openEdit(c)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><Edit size={16}/></button>
                <button onClick={()=>setDelId(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><Trash2 size={16}/></button>
              </div></td>
            </tr>))}</tbody>
          </table>
        </div>}
      </div>

      {delId&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDelId(null)}>
        <div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%'}} onClick={e=>e.stopPropagation()}>
          <h3 style={{fontSize:18,fontFamily:'var(--font-display)',marginBottom:8}}>Delete Client?</h3>
          <p style={{fontSize:14,color:'var(--muted)',marginBottom:24}}>This client will be archived.</p>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>setDelId(null)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button>
            <button onClick={()=>del(delId)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'var(--status-danger)',border:'none',color:'#fff',fontFamily:'var(--font-ui)',fontWeight:600}}>Delete</button>
          </div>
        </div>
      </div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 20px',overflowY:'auto'}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:600,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>{mode==='add'?'New Client':mode==='edit'?'Edit Client':'Client Details'}</h3>
            <div style={{display:'flex',gap:8}}>
              {mode==='view'&&<button onClick={()=>setMode('edit')} style={{display:'flex',alignItems:'center',gap:6,background:'var(--accent-soft)',color:'var(--accent)',border:'none',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-ui)'}}><Edit size={14}/>Edit</button>}
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button>
            </div>
          </div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Business Name *</label>{mode==='view'?<div style={{fontSize:14,fontWeight:600}}>{form.business_name||'—'}</div>:<input style={IS} value={form.business_name||''} onChange={e=>set('business_name',e.target.value)} placeholder="Business name" required/>}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>First Name</label>{mode==='view'?<div style={{fontSize:14}}>{form.contact_first_name||'—'}</div>:<input style={IS} value={form.contact_first_name||''} onChange={e=>set('contact_first_name',e.target.value)} placeholder="First name"/>}</div>
              <div><label style={LS}>Last Name</label>{mode==='view'?<div style={{fontSize:14}}>{form.contact_last_name||'—'}</div>:<input style={IS} value={form.contact_last_name||''} onChange={e=>set('contact_last_name',e.target.value)} placeholder="Last name"/>}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Email</label>{mode==='view'?<div style={{fontSize:14}}>{form.email?<a href={`mailto:${form.email}`} style={{color:'var(--accent)'}}>{form.email}</a>:'—'}</div>:<input style={IS} type="email" value={form.email||''} onChange={e=>set('email',e.target.value)} placeholder="email@example.com"/>}</div>
              <div><label style={LS}>Phone</label>{mode==='view'?<div style={{fontSize:14}}>{form.phone?<a href={`tel:${form.phone}`} style={{color:'var(--accent)'}}>{form.phone}</a>:'—'}</div>:<input style={IS} type="tel" value={form.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="(407) 555-1234"/>}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Website</label>{mode==='view'?<div style={{fontSize:14}}>{form.website?<a href={form.website} target="_blank" rel="noopener" style={{color:'var(--accent)',display:'flex',alignItems:'center',gap:4}}>{form.website}<ExternalLink size={12}/></a>:'—'}</div>:<input style={IS} value={form.website||''} onChange={e=>set('website',e.target.value)} placeholder="https://"/>}</div>
              <div><label style={LS}>Status</label>{mode==='view'?<span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:12,fontWeight:600,textTransform:'capitalize',background:SC[form.status]?.bg||'#f5f5f5',color:SC[form.status]?.fg||'#666'}}>{form.status}</span>:<select style={IS} value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>}</div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Address</label>{mode==='view'?<div style={{fontSize:14}}>{form.address||'—'}</div>:<input style={IS} value={form.address||''} onChange={e=>set('address',e.target.value)} placeholder="Street, City, State, ZIP"/>}</div>
            <div style={{marginBottom:16}}><label style={LS}>Notes</label>{mode==='view'?<div style={{fontSize:14,whiteSpace:'pre-wrap',lineHeight:1.7}}>{form.notes||'No notes.'}</div>:<textarea style={{...IS,minHeight:100,resize:'vertical'}} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Add notes..."/>}</div>
          </div>
          {mode!=='view'&&<div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button>
            <button onClick={save} disabled={saving||!form.business_name} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.business_name?0.7:1}}>{saving?'Saving...':mode==='add'?'Create Client':'Save Changes'}</button>
          </div>}
        </div>
      </div>}
    </div>
  )
}
