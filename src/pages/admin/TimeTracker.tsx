import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Clock, Calendar } from 'lucide-react'

interface TimeEntry { id:string; project_id:string|null; client_id:string|null; description:string|null; hours:number; date:string; billable:boolean; created_at:string }
interface Opt { id:string; name:string }

export default function TimeTracker() {
  const [entries,setEntries]=useState<TimeEntry[]>([]); const [clients,setClients]=useState<Opt[]>([]); const [projects,setProjects]=useState<{id:string;name:string;client_id:string|null}[]>([])
  const [loading,setLoading]=useState(true); const [modal,setModal]=useState(false); const [saving,setSaving]=useState(false)
  const [period,setPeriod]=useState('week')
  const [form,setForm]=useState({project_id:null as string|null,client_id:null as string|null,description:'',hours:0,date:new Date().toISOString().split('T')[0],billable:true})

  async function load(){
    setLoading(true)
    const now=new Date(); let start:string
    if(period==='week'){const d=new Date(now);d.setDate(d.getDate()-7);start=d.toISOString().split('T')[0]}
    else if(period==='month') start=new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
    else start='2020-01-01'
    const [{data:t},{data:c},{data:p}]=await Promise.all([
      supabase.from('time_entries').select('*').gte('date',start).order('date',{ascending:false}),
      supabase.from('clients').select('id,business_name').is('deleted_at',null).order('business_name'),
      supabase.from('projects').select('id,project_name,client_id').is('deleted_at',null).order('project_name')
    ])
    if(t) setEntries(t); if(c) setClients(c.map(x=>({id:x.id,name:x.business_name}))); if(p) setProjects(p.map(x=>({id:x.id,name:x.project_name,client_id:x.client_id})))
    setLoading(false)
  }
  useEffect(()=>{load()},[period])

  const totalHours=entries.reduce((s,e)=>s+Number(e.hours),0)
  const billableHours=entries.filter(e=>e.billable).reduce((s,e)=>s+Number(e.hours),0)
  const uniqueDays=new Set(entries.map(e=>e.date)).size

  function getName(list:{id:string;name:string}[],id:string|null){return list.find(x=>x.id===id)?.name||'—'}

  async function save(){
    setSaving(true)
    await supabase.from('time_entries').insert({...form,hours:Number(form.hours)})
    setSaving(false);setModal(false);setForm({project_id:null,client_id:null,description:'',hours:0,date:new Date().toISOString().split('T')[0],billable:true});load()
  }

  function set(k:string,v:string|number|boolean|null){setForm(p=>({...p,[k]:v}))}
  function fmtDate(d:string){return new Date(d+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Time Tracker</h2></div>
        <button onClick={()=>setModal(true)} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>Log Time</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16,marginBottom:24}}>
        {[{l:'Total Hours',v:totalHours.toFixed(1),icon:Clock,color:'#C5A44B'},{l:'Billable Hours',v:billableHours.toFixed(1),icon:Clock,color:'#2D8A54'},{l:'Days Tracked',v:uniqueDays,icon:Calendar,color:'#6B8CAE'}].map(c=>(
          <div key={c.l} style={{background:'#fff',border:'1px solid var(--line)',borderRadius:12,padding:20}}>
            <c.icon size={20} color={c.color} style={{marginBottom:12}}/>
            <div style={{fontSize:24,fontWeight:600,color:'var(--text)',fontFamily:'var(--font-display)'}}>{c.v}</div>
            <div style={{fontSize:11,color:'var(--muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginTop:4}}>{c.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{k:'week',l:'This Week'},{k:'month',l:'This Month'},{k:'all',l:'All Time'}].map(f=>(<button key={f.k} onClick={()=>setPeriod(f.k)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer',border:'1px solid',background:period===f.k?'var(--brand)':'transparent',color:period===f.k?'var(--accent)':'var(--muted)',borderColor:period===f.k?'var(--brand)':'var(--line)'}}>{f.l}</button>))}
      </div>

      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
        entries.length===0?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>No time entries yet.</div>:
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead><tr style={{borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>
            {['Date','Description','Project','Client','Hours','Billable'].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:h==='Hours'?'right':'left',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>{h}</th>))}
          </tr></thead>
          <tbody>{entries.map(e=>(<tr key={e.id} style={{borderBottom:'1px solid var(--line)'}}>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{fmtDate(e.date)}</td>
            <td style={{padding:'14px 16px',fontWeight:500}}>{e.description||'—'}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{getName(projects,e.project_id)}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{getName(clients,e.client_id)}</td>
            <td style={{padding:'14px 16px',fontWeight:600,textAlign:'right'}}>{Number(e.hours).toFixed(1)}h</td>
            <td style={{padding:'14px 16px'}}><span style={{display:'inline-block',padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:600,background:e.billable?'#E8F5EC':'#F5F5F5',color:e.billable?'#2D8A54':'#666'}}>{e.billable?'Yes':'No'}</span></td>
          </tr>))}</tbody>
        </table></div>}
      </div>

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:500,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>Log Time</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Description</label><input style={IS} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What did you work on?"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Hours</label><input style={IS} type="number" min="0.25" step="0.25" value={form.hours||''} onChange={e=>set('hours',Number(e.target.value))} placeholder="0.0"/></div>
              <div><label style={LS}>Date</label><input style={IS} type="date" value={form.date} onChange={e=>set('date',e.target.value)}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Client</label><select style={IS} value={form.client_id||''} onChange={e=>set('client_id',e.target.value||null)}><option value="">Select client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label style={LS}>Project</label><select style={IS} value={form.project_id||''} onChange={e=>set('project_id',e.target.value||null)}><option value="">Select project</option>{projects.filter(p=>!form.client_id||p.client_id===form.client_id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            </div>
            <div style={{marginBottom:16}}><label style={{...LS,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={form.billable} onChange={e=>set('billable',e.target.checked)} style={{accentColor:'var(--accent)'}}/> Billable</label></div>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.hours} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.hours?0.7:1}}>{saving?'Saving...':'Log Time'}</button></div>
        </div>
      </div>}
    </div>
  )
}
