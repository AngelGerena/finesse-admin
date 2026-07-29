import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Edit, Trash2, AlertTriangle } from 'lucide-react'

interface Renewal { id:string; client_id:string|null; service_type:string|null; amount:number|null; frequency:string; next_renewal_date:string|null; auto_renew:boolean; status:string; notes:string|null; created_at:string }
interface Opt { id:string; business_name:string }

const STATUSES=['active','cancelled','expired','pending']
const TYPES=['hosting','domain','care_plan','retainer','other']
const FREQS=['monthly','quarterly','annually']
const SC:Record<string,{bg:string;fg:string}>={active:{bg:'#E8F5EC',fg:'#2D8A54'},cancelled:{bg:'#FFF5F5',fg:'#C53030'},expired:{bg:'#F5F5F5',fg:'#666'},pending:{bg:'#FFF8E1',fg:'#B8860B'}}
const EMPTY={client_id:null as string|null,service_type:null as string|null,amount:null as number|null,frequency:'monthly',next_renewal_date:null as string|null,auto_renew:true,status:'active',notes:null as string|null}

export default function Renewals() {
  const [renewals,setRenewals]=useState<Renewal[]>([]); const [clients,setClients]=useState<Opt[]>([])
  const [loading,setLoading]=useState(true); const [modal,setModal]=useState(false); const [mode,setMode]=useState<'add'|'edit'>('add')
  const [form,setForm]=useState<typeof EMPTY & {id?:string}>(EMPTY); const [saving,setSaving]=useState(false); const [delId,setDelId]=useState<string|null>(null)

  async function load(){
    setLoading(true)
    const [{data:r},{data:c}]=await Promise.all([supabase.from('renewals').select('*').is('deleted_at',null).order('next_renewal_date'),supabase.from('clients').select('id,business_name').is('deleted_at',null).order('business_name')])
    if(r) setRenewals(r); if(c) setClients(c); setLoading(false)
  }
  useEffect(()=>{load()},[])

  const totalMRR=renewals.filter(r=>r.status==='active').reduce((s,r)=>{
    const a=Number(r.amount||0); if(r.frequency==='monthly') return s+a; if(r.frequency==='quarterly') return s+a/3; return s+a/12
  },0)

  const upcoming=renewals.filter(r=>{if(!r.next_renewal_date||r.status!=='active') return false; const d=new Date(r.next_renewal_date),now=new Date(),diff=(d.getTime()-now.getTime())/(1000*60*60*24); return diff<=30&&diff>=0})

  function clientName(id:string|null){return clients.find(c=>c.id===id)?.business_name||'—'}
  function openAdd(){setForm({...EMPTY});setMode('add');setModal(true)}
  function openEdit(r:Renewal){setForm({...r});setMode('edit');setModal(true)}

  async function save(){
    setSaving(true)
    const p={client_id:form.client_id||null,service_type:form.service_type||null,amount:form.amount?Number(form.amount):null,frequency:form.frequency,next_renewal_date:form.next_renewal_date||null,auto_renew:form.auto_renew,status:form.status,notes:form.notes||null,updated_at:new Date().toISOString()}
    if(mode==='edit'&&form.id) await supabase.from('renewals').update(p).eq('id',form.id)
    else await supabase.from('renewals').insert(p)
    setSaving(false);setModal(false);load()
  }
  async function del(id:string){await supabase.from('renewals').update({deleted_at:new Date().toISOString()}).eq('id',id);setDelId(null);load()}
  function set(k:string,v:string|number|boolean|null){setForm(p=>({...p,[k]:v}))}
  function fmtDate(d:string){return new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
  function fmtCur(n:number){return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Renewals</h2><p style={{fontSize:13,color:'var(--muted)',marginTop:4}}>MRR: <span style={{color:'var(--accent)',fontWeight:600}}>{fmtCur(totalMRR)}</span></p></div>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>Add Renewal</button>
      </div>

      {upcoming.length>0&&<div style={{background:'#FFF8E1',border:'1px solid #F0E68C',borderRadius:12,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
        <AlertTriangle size={20} color="#B8860B"/><div style={{fontSize:13,color:'#8B7500'}}><strong>{upcoming.length} renewal{upcoming.length!==1?'s':''}</strong> due within the next 30 days.</div>
      </div>}

      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
        renewals.length===0?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>No renewals tracked yet.</div>:
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead><tr style={{borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>
            {['Client','Service','Amount','Frequency','Next Renewal','Auto-Renew','Status',''].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>{h}</th>))}
          </tr></thead>
          <tbody>{renewals.map(r=>(<tr key={r.id} style={{borderBottom:'1px solid var(--line)'}}>
            <td style={{padding:'14px 16px',fontWeight:500}}>{clientName(r.client_id)}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)',textTransform:'capitalize'}}>{r.service_type?.replace('_',' ')||'—'}</td>
            <td style={{padding:'14px 16px',fontWeight:600}}>{r.amount?fmtCur(Number(r.amount)):'—'}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)',textTransform:'capitalize'}}>{r.frequency}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{r.next_renewal_date?fmtDate(r.next_renewal_date):'—'}</td>
            <td style={{padding:'14px 16px'}}><span style={{fontSize:12,color:r.auto_renew?'#2D8A54':'#666'}}>{r.auto_renew?'Yes':'No'}</span></td>
            <td style={{padding:'14px 16px'}}><span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:600,textTransform:'capitalize',background:SC[r.status]?.bg||'#f5f5f5',color:SC[r.status]?.fg||'#666'}}>{r.status}</span></td>
            <td style={{padding:'14px 16px'}}><div style={{display:'flex',gap:6}}><button onClick={()=>openEdit(r)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><Edit size={16}/></button><button onClick={()=>setDelId(r.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><Trash2 size={16}/></button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>

      {delId&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDelId(null)}><div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%'}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',marginBottom:8}}>Delete Renewal?</h3><p style={{fontSize:14,color:'var(--muted)',marginBottom:24}}>This renewal will be archived.</p><div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setDelId(null)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={()=>del(delId)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'var(--status-danger)',border:'none',color:'#fff',fontFamily:'var(--font-ui)',fontWeight:600}}>Delete</button></div></div></div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:500,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>{mode==='add'?'Add Renewal':'Edit Renewal'}</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Client</label><select style={IS} value={form.client_id||''} onChange={e=>set('client_id',e.target.value||null)}><option value="">Select client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.business_name}</option>)}</select></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Service Type</label><select style={IS} value={form.service_type||''} onChange={e=>set('service_type',e.target.value||null)}><option value="">Select type</option>{TYPES.map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}</select></div>
              <div><label style={LS}>Amount</label><input style={IS} type="number" min="0" step="5" value={form.amount||''} onChange={e=>set('amount',e.target.value?Number(e.target.value):null)} placeholder="$0"/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Frequency</label><select style={IS} value={form.frequency} onChange={e=>set('frequency',e.target.value)}>{FREQS.map(f=><option key={f} value={f}>{f}</option>)}</select></div>
              <div><label style={LS}>Next Renewal Date</label><input style={IS} type="date" value={form.next_renewal_date||''} onChange={e=>set('next_renewal_date',e.target.value||null)}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Status</label><select style={IS} value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{display:'flex',alignItems:'flex-end',paddingBottom:4}}><label style={{...LS,display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:0}}><input type="checkbox" checked={form.auto_renew} onChange={e=>set('auto_renew',e.target.checked)} style={{accentColor:'var(--accent)'}}/> Auto-Renew</label></div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Notes</label><textarea style={{...IS,minHeight:60,resize:'vertical'}} value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Notes..."/></div>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving?0.7:1}}>{saving?'Saving...':mode==='add'?'Add Renewal':'Save Changes'}</button></div>
        </div>
      </div>}
    </div>
  )
}
