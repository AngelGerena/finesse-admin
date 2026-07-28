import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, DollarSign, TrendingUp, Calendar } from 'lucide-react'

interface RevenueEntry { id:string; client_id:string|null; project_id:string|null; description:string; amount:number; payment_method:string|null; payment_date:string; category:string; notes:string|null; created_at:string }
interface ClientOpt { id:string; business_name:string }
interface ProjectOpt { id:string; project_name:string; client_id:string|null }

const METHODS = ['stripe','zelle','cash_app','cash','check','other']
const CATEGORIES = ['project','retainer','hosting','photography','other']
const EMPTY = {client_id:null as string|null,project_id:null as string|null,description:'',amount:0,payment_method:null as string|null,payment_date:new Date().toISOString().split('T')[0],category:'project',notes:null as string|null}

export default function Revenue() {
  const [entries,setEntries]=useState<RevenueEntry[]>([]); const [clients,setClients]=useState<ClientOpt[]>([]); const [projects,setProjects]=useState<ProjectOpt[]>([])
  const [loading,setLoading]=useState(true); const [modal,setModal]=useState(false)
  const [form,setForm]=useState<typeof EMPTY>(EMPTY); const [saving,setSaving]=useState(false)
  const [period,setPeriod]=useState('all')

  async function load(){
    setLoading(true)
    let q=supabase.from('revenue').select('*').order('payment_date',{ascending:false})
    if(period!=='all'){
      const now=new Date(); let start:string
      if(period==='month') start=new Date(now.getFullYear(),now.getMonth(),1).toISOString().split('T')[0]
      else if(period==='quarter'){const qm=Math.floor(now.getMonth()/3)*3; start=new Date(now.getFullYear(),qm,1).toISOString().split('T')[0]}
      else start=new Date(now.getFullYear(),0,1).toISOString().split('T')[0]
      q=q.gte('payment_date',start)
    }
    const [{data:rev},{data:cl},{data:pr}]=await Promise.all([q,supabase.from('clients').select('id,business_name').is('deleted_at',null).order('business_name'),supabase.from('projects').select('id,project_name,client_id').is('deleted_at',null).order('project_name')])
    if(rev) setEntries(rev); if(cl) setClients(cl); if(pr) setProjects(pr)
    setLoading(false)
  }
  useEffect(()=>{load()},[period])

  const total=entries.reduce((s,e)=>s+Number(e.amount),0)
  const thisMonth=entries.filter(e=>{const d=new Date(e.payment_date),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}).reduce((s,e)=>s+Number(e.amount),0)
  const avgPerEntry=entries.length?total/entries.length:0

  function clientName(id:string|null){return clients.find(c=>c.id===id)?.business_name||'—'}
  function projectName(id:string|null){return projects.find(p=>p.id===id)?.project_name||'—'}

  async function save(){
    setSaving(true)
    await supabase.from('revenue').insert({...form,amount:Number(form.amount)})
    setSaving(false);setModal(false);setForm({...EMPTY,payment_date:new Date().toISOString().split('T')[0]});load()
  }

  function set(k:string,v:string|number|null){setForm(p=>({...p,[k]:v}))}
  function fmtDate(d:string){return new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
  function fmtCur(n:number){return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Revenue</h2><p style={{fontSize:13,color:'var(--muted)',marginTop:4}}>{entries.length} payment{entries.length!==1?'s':''} recorded</p></div>
        <button onClick={()=>{setForm({...EMPTY,payment_date:new Date().toISOString().split('T')[0]});setModal(true)}} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>Log Payment</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        {[{label:'Total Revenue',value:fmtCur(total),icon:DollarSign,color:'#C5A44B'},{label:'This Month',value:fmtCur(thisMonth),icon:Calendar,color:'#6B8CAE'},{label:'Avg per Payment',value:fmtCur(avgPerEntry),icon:TrendingUp,color:'#8BAA97'}].map(c=>(
          <div key={c.label} style={{background:'#fff',border:'1px solid var(--line)',borderRadius:12,padding:'20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}><div style={{width:36,height:36,borderRadius:8,background:`${c.color}15`,border:`1px solid ${c.color}25`,display:'flex',alignItems:'center',justifyContent:'center'}}><c.icon size={18} color={c.color}/></div></div>
            <div style={{fontSize:24,fontWeight:600,color:'var(--text)',fontFamily:'var(--font-display)'}}>{c.value}</div>
            <div style={{fontSize:11,color:'var(--muted)',letterSpacing:'0.08em',textTransform:'uppercase',marginTop:4}}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Period filter */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{k:'all',l:'All Time'},{k:'year',l:'This Year'},{k:'quarter',l:'This Quarter'},{k:'month',l:'This Month'}].map(f=>(<button key={f.k} onClick={()=>setPeriod(f.k)} style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer',border:'1px solid',background:period===f.k?'var(--brand)':'transparent',color:period===f.k?'var(--accent)':'var(--muted)',borderColor:period===f.k?'var(--brand)':'var(--line)'}}>{f.l}</button>))}
      </div>

      {/* Table */}
      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
        entries.length===0?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>No payments recorded yet.</div>:
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead><tr style={{borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>
            {['Date','Description','Client','Project','Method','Category','Amount'].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:h==='Amount'?'right':'left',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>{h}</th>))}
          </tr></thead>
          <tbody>{entries.map(e=>(<tr key={e.id} style={{borderBottom:'1px solid var(--line)'}}>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{fmtDate(e.payment_date)}</td>
            <td style={{padding:'14px 16px',fontWeight:500,color:'var(--text)'}}>{e.description}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{clientName(e.client_id)}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{projectName(e.project_id)}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)',textTransform:'capitalize'}}>{e.payment_method?.replace('_',' ')||'—'}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)',textTransform:'capitalize'}}>{e.category}</td>
            <td style={{padding:'14px 16px',fontWeight:600,color:'var(--status-success)',textAlign:'right'}}>{fmtCur(Number(e.amount))}</td>
          </tr>))}</tbody>
        </table></div>}
      </div>

      {/* Add Payment Modal */}
      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 20px',overflowY:'auto'}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:560,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>Log Payment</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Description *</label><input style={IS} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What was this payment for?"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Amount *</label><input style={IS} type="number" min="0" step="0.01" value={form.amount||''} onChange={e=>set('amount',Number(e.target.value))} placeholder="$0.00"/></div>
              <div><label style={LS}>Date</label><input style={IS} type="date" value={form.payment_date} onChange={e=>set('payment_date',e.target.value)}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Client</label><select style={IS} value={form.client_id||''} onChange={e=>set('client_id',e.target.value||null)}><option value="">Select client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.business_name}</option>)}</select></div>
              <div><label style={LS}>Project</label><select style={IS} value={form.project_id||''} onChange={e=>set('project_id',e.target.value||null)}><option value="">Select project</option>{projects.filter(p=>!form.client_id||p.client_id===form.client_id).map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}</select></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Payment Method</label><select style={IS} value={form.payment_method||''} onChange={e=>set('payment_method',e.target.value||null)}><option value="">Select method</option>{METHODS.map(m=><option key={m} value={m}>{m.replace('_',' ')}</option>)}</select></div>
              <div><label style={LS}>Category</label><select style={IS} value={form.category} onChange={e=>set('category',e.target.value)}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Notes</label><textarea style={{...IS,minHeight:60,resize:'vertical'}} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Optional notes..."/></div>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.description||!form.amount} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.description||!form.amount?0.7:1}}>{saving?'Saving...':'Log Payment'}</button></div>
        </div>
      </div>}
    </div>
  )
}
