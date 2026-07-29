import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Edit, Trash2, Pin, Search } from 'lucide-react'

interface Doc { id:string; title:string; content:string|null; category:string; client_id:string|null; project_id:string|null; pinned:boolean; created_at:string; updated_at:string }
interface Opt { id:string; name:string }

const CATS=['general','contract','proposal','sop','template','notes']

export default function Docs() {
  const [docs,setDocs]=useState<Doc[]>([]); const [clients,setClients]=useState<Opt[]>([]); const [projects,setProjects]=useState<Opt[]>([])
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState(''); const [catFilter,setCatFilter]=useState('all')
  const [modal,setModal]=useState(false); const [mode,setMode]=useState<'add'|'edit'|'view'>('add')
  const [form,setForm]=useState<any>({}); const [saving,setSaving]=useState(false); const [delId,setDelId]=useState<string|null>(null)

  async function load(){
    setLoading(true)
    let q=supabase.from('docs').select('*').is('deleted_at',null).order('pinned',{ascending:false}).order('updated_at',{ascending:false})
    if(catFilter!=='all') q=q.eq('category',catFilter)
    const [{data:d},{data:cl},{data:pr}]=await Promise.all([q,supabase.from('clients').select('id,business_name').is('deleted_at',null),supabase.from('projects').select('id,project_name').is('deleted_at',null)])
    if(d) setDocs(d); if(cl) setClients(cl.map(c=>({id:c.id,name:c.business_name}))); if(pr) setProjects(pr.map(p=>({id:p.id,name:p.project_name})))
    setLoading(false)
  }
  useEffect(()=>{load()},[catFilter])

  const filtered=docs.filter(d=>{if(!search) return true; const q=search.toLowerCase(); return d.title.toLowerCase().includes(q)||(d.content||'').toLowerCase().includes(q)})

  function openAdd(){setForm({title:'',content:'',category:'general',client_id:null,project_id:null,pinned:false});setMode('add');setModal(true)}
  function openView(d:Doc){setForm({...d});setMode('view');setModal(true)}

  async function save(){
    setSaving(true)
    const p={title:form.title,content:form.content||null,category:form.category,client_id:form.client_id||null,project_id:form.project_id||null,pinned:form.pinned||false,updated_at:new Date().toISOString()}
    if(mode==='edit'&&form.id) await supabase.from('docs').update(p).eq('id',form.id)
    else await supabase.from('docs').insert(p)
    setSaving(false);setModal(false);load()
  }
  async function del(id:string){await supabase.from('docs').update({deleted_at:new Date().toISOString()}).eq('id',id);setDelId(null);load()}
  async function togglePin(id:string,current:boolean){await supabase.from('docs').update({pinned:!current}).eq('id',id);load()}

  function getName(list:Opt[],id:string|null){return list.find(x=>x.id===id)?.name||''}
  function fmtDate(d:string){return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
  function preview(text:string|null){if(!text) return 'Empty document'; return text.substring(0,120)+(text.length>120?'...':'')}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Docs &amp; Notes</h2>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>New Doc</button>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['all',...CATS].map(c=>(<button key={c} onClick={()=>setCatFilter(c)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer',border:'1px solid',textTransform:'capitalize',background:catFilter===c?'var(--brand)':'transparent',color:catFilter===c?'var(--accent)':'var(--muted)',borderColor:catFilter===c?'var(--brand)':'var(--line)'}}>{c}</button>))}
      </div>

      <div style={{position:'relative',marginBottom:20}}><Search size={16} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)'}}/><input placeholder="Search docs..." value={search} onChange={e=>setSearch(e.target.value)} style={{...IS,paddingLeft:38,background:'#fff',width:'100%'}}/></div>

      {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
      filtered.length===0?<div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',padding:40,textAlign:'center',color:'var(--muted)'}}>No docs found.</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
        {filtered.map(d=>(<div key={d.id} onClick={()=>openView(d)} style={{background:'#fff',borderRadius:12,border:`1px solid ${d.pinned?'var(--accent)':'var(--line)'}`,padding:20,cursor:'pointer',transition:'all 0.2s',position:'relative'}} onMouseOver={e=>(e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)')} onMouseOut={e=>(e.currentTarget.style.boxShadow='none')}>
          {d.pinned&&<Pin size={14} color="var(--accent)" style={{position:'absolute',top:12,right:12}}/>}
          <div style={{fontSize:11,color:'var(--muted)',textTransform:'capitalize',marginBottom:6}}>{d.category}</div>
          <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{d.title}</div>
          <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.6}}>{preview(d.content)}</div>
          <div style={{display:'flex',gap:8,marginTop:12,fontSize:11,color:'var(--muted)'}}>
            {d.client_id&&<span>{getName(clients,d.client_id)}</span>}
            <span style={{marginLeft:'auto'}}>{fmtDate(d.updated_at)}</span>
          </div>
        </div>))}
      </div>}

      {delId&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDelId(null)}><div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%'}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',marginBottom:8}}>Delete Doc?</h3><p style={{fontSize:14,color:'var(--muted)',marginBottom:24}}>This document will be archived.</p><div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setDelId(null)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={()=>del(delId)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'var(--status-danger)',border:'none',color:'#fff',fontFamily:'var(--font-ui)',fontWeight:600}}>Delete</button></div></div></div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px',overflowY:'auto'}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:700,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>{mode==='add'?'New Doc':mode==='edit'?'Edit Doc':form.title}</h3>
            <div style={{display:'flex',gap:8}}>
              {mode==='view'&&<><button onClick={()=>togglePin(form.id,form.pinned)} style={{background:'none',border:'none',cursor:'pointer',color:form.pinned?'var(--accent)':'var(--muted)',padding:4}}><Pin size={16}/></button><button onClick={()=>setMode('edit')} style={{display:'flex',alignItems:'center',gap:6,background:'var(--accent-soft)',color:'var(--accent)',border:'none',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-ui)'}}><Edit size={14}/>Edit</button><button onClick={()=>{setModal(false);setDelId(form.id)}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><Trash2 size={16}/></button></>}
              <button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button>
            </div>
          </div>
          <div style={{padding:28}}>
            {mode==='view'?<>
              <div style={{display:'flex',gap:12,marginBottom:16}}><span style={{fontSize:11,textTransform:'capitalize',padding:'3px 10px',borderRadius:12,background:'var(--accent-soft)',color:'var(--accent)',fontWeight:600}}>{form.category}</span>{form.client_id&&<span style={{fontSize:11,color:'var(--muted)'}}>{getName(clients,form.client_id)}</span>}{form.project_id&&<span style={{fontSize:11,color:'var(--muted)'}}>{getName(projects,form.project_id)}</span>}</div>
              <div style={{fontSize:14,color:'var(--text)',whiteSpace:'pre-wrap',lineHeight:1.8,minHeight:200}}>{form.content||'Empty document.'}</div>
            </>:<>
              <div style={{marginBottom:16}}><label style={LS}>Title</label><input style={IS} value={form.title||''} onChange={e=>setForm((p:any)=>({...p,title:e.target.value}))} placeholder="Document title"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
                <div><label style={LS}>Category</label><select style={IS} value={form.category} onChange={e=>setForm((p:any)=>({...p,category:e.target.value}))}>{CATS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={LS}>Client</label><select style={IS} value={form.client_id||''} onChange={e=>setForm((p:any)=>({...p,client_id:e.target.value||null}))}><option value="">None</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label style={LS}>Project</label><select style={IS} value={form.project_id||''} onChange={e=>setForm((p:any)=>({...p,project_id:e.target.value||null}))}><option value="">None</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              </div>
              <div style={{marginBottom:16}}><label style={LS}>Content</label><textarea style={{...IS,minHeight:300,resize:'vertical',fontFamily:'monospace',fontSize:13,lineHeight:1.7}} value={form.content||''} onChange={e=>setForm((p:any)=>({...p,content:e.target.value}))} placeholder="Write your document here..."/></div>
              <label style={{...LS,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={form.pinned||false} onChange={e=>setForm((p:any)=>({...p,pinned:e.target.checked}))} style={{accentColor:'var(--accent)'}}/> Pin to top</label>
            </>}
          </div>
          {mode!=='view'&&<div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.title} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.title?0.7:1}}>{saving?'Saving...':mode==='add'?'Create Doc':'Save Changes'}</button></div>}
        </div>
      </div>}
    </div>
  )
}
