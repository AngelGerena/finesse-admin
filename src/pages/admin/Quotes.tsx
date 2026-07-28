import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Edit, Trash2 } from 'lucide-react'

interface Quote { id:string; quote_number:string; client_id:string|null; lead_id:string|null; items:QuoteItem[]; subtotal:number; discount_pct:number; total:number; status:string; valid_until:string|null; notes:string|null; created_at:string; updated_at:string }
interface QuoteItem { description:string; qty:number; rate:number; amount:number }
interface ClientOpt { id:string; business_name:string }

const STATUSES = ['draft','sent','accepted','declined','expired']
const SC: Record<string,{bg:string;fg:string}> = {
  draft:{bg:'#F5F5F5',fg:'#666'}, sent:{bg:'#EBF8FF',fg:'#2B6CB0'},
  accepted:{bg:'#E8F5EC',fg:'#2D8A54'}, declined:{bg:'#FFF5F5',fg:'#C53030'},
  expired:{bg:'#FFF8E1',fg:'#B8860B'}
}

export default function Quotes() {
  const [quotes,setQuotes]=useState<Quote[]>([]); const [clients,setClients]=useState<ClientOpt[]>([])
  const [loading,setLoading]=useState(true); const [modal,setModal]=useState(false); const [mode,setMode]=useState<'add'|'edit'|'view'>('add')
  const [form,setForm]=useState<any>({}); const [saving,setSaving]=useState(false); const [delId,setDelId]=useState<string|null>(null)

  async function load(){
    setLoading(true)
    const [{data:q},{data:c}]=await Promise.all([supabase.from('quotes').select('*').is('deleted_at',null).order('created_at',{ascending:false}),supabase.from('clients').select('id,business_name').is('deleted_at',null).order('business_name')])
    if(q) setQuotes(q); if(c) setClients(c); setLoading(false)
  }
  useEffect(()=>{load()},[])

  async function getNextNumber(){
    const {data}=await supabase.from('counters').select('current_value').eq('id','quote').single()
    const next=(data?.current_value||0)+1
    await supabase.from('counters').update({current_value:next}).eq('id','quote')
    return `FM-Q${String(next).padStart(4,'0')}`
  }

  function clientName(id:string|null){return clients.find(c=>c.id===id)?.business_name||'—'}
  function calcItems(items:QuoteItem[]){const sub=items.reduce((s,i)=>s+i.amount,0); return sub}

  async function openAdd(){
    const num=await getNextNumber()
    setForm({quote_number:num,client_id:null,lead_id:null,items:[{description:'',qty:1,rate:0,amount:0}],subtotal:0,discount_pct:0,total:0,status:'draft',valid_until:null,notes:null})
    setMode('add');setModal(true)
  }
  function openEdit(q:Quote){setForm({...q,items:q.items||[{description:'',qty:1,rate:0,amount:0}]});setMode('edit');setModal(true)}
  function openView(q:Quote){setForm({...q});setMode('view');setModal(true)}

  function updateItem(idx:number,field:string,value:string|number){
    const items=[...form.items]; items[idx]={...items[idx],[field]:value}
    if(field==='qty'||field==='rate') items[idx].amount=Number(items[idx].qty)*Number(items[idx].rate)
    const sub=calcItems(items); const total=sub*(1-(form.discount_pct||0)/100)
    setForm((p:any)=>({...p,items,subtotal:sub,total}))
  }
  function addItem(){setForm((p:any)=>({...p,items:[...p.items,{description:'',qty:1,rate:0,amount:0}]}))}
  function removeItem(idx:number){const items=form.items.filter((_:any,i:number)=>i!==idx); const sub=calcItems(items); const total=sub*(1-(form.discount_pct||0)/100); setForm((p:any)=>({...p,items,subtotal:sub,total}))}
  function setDiscount(v:number){const total=form.subtotal*(1-v/100); setForm((p:any)=>({...p,discount_pct:v,total}))}

  async function save(){
    setSaving(true)
    const p={quote_number:form.quote_number,client_id:form.client_id||null,lead_id:form.lead_id||null,items:form.items,subtotal:form.subtotal,discount_pct:form.discount_pct,total:form.total,status:form.status,valid_until:form.valid_until||null,notes:form.notes||null,updated_at:new Date().toISOString()}
    if(mode==='edit'&&form.id) await supabase.from('quotes').update(p).eq('id',form.id)
    else await supabase.from('quotes').insert(p)
    setSaving(false);setModal(false);load()
  }
  async function del(id:string){await supabase.from('quotes').update({deleted_at:new Date().toISOString()}).eq('id',id);setDelId(null);load()}

  function fmtDate(d:string){return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
  function fmtCur(n:number){return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div><h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Quotes</h2><p style={{fontSize:13,color:'var(--muted)',marginTop:4}}>{quotes.length} quote{quotes.length!==1?'s':''}</p></div>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>New Quote</button>
      </div>

      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
        quotes.length===0?<div style={{padding:40,textAlign:'center'}}><div style={{color:'var(--muted)',marginBottom:8}}>No quotes yet.</div><button onClick={openAdd} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:14,fontFamily:'var(--font-ui)'}}>Create your first quote</button></div>:
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead><tr style={{borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>
            {['Quote #','Client','Status','Items','Total','Valid Until','Created',''].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:h==='Total'?'right':'left',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)'}}>{h}</th>))}
          </tr></thead>
          <tbody>{quotes.map(q=>(<tr key={q.id} style={{borderBottom:'1px solid var(--line)',cursor:'pointer'}} onClick={()=>openView(q)}>
            <td style={{padding:'14px 16px',fontWeight:600,color:'var(--accent)',fontFamily:'monospace'}}>{q.quote_number}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{clientName(q.client_id)}</td>
            <td style={{padding:'14px 16px'}}><span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:11,fontWeight:600,textTransform:'capitalize',background:SC[q.status]?.bg||'#f5f5f5',color:SC[q.status]?.fg||'#666'}}>{q.status}</span></td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{(q.items||[]).length}</td>
            <td style={{padding:'14px 16px',fontWeight:600,color:'var(--text)',textAlign:'right'}}>{fmtCur(Number(q.total))}</td>
            <td style={{padding:'14px 16px',fontSize:13,color:'var(--muted)'}}>{q.valid_until?fmtDate(q.valid_until):'—'}</td>
            <td style={{padding:'14px 16px',fontSize:12,color:'var(--muted)'}}>{fmtDate(q.created_at)}</td>
            <td style={{padding:'14px 16px'}} onClick={e=>e.stopPropagation()}><div style={{display:'flex',gap:6}}><button onClick={()=>openEdit(q)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><Edit size={16}/></button><button onClick={()=>setDelId(q.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><Trash2 size={16}/></button></div></td>
          </tr>))}</tbody>
        </table></div>}
      </div>

      {delId&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDelId(null)}><div style={{background:'#fff',borderRadius:16,padding:32,maxWidth:400,width:'90%'}} onClick={e=>e.stopPropagation()}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',marginBottom:8}}>Delete Quote?</h3><p style={{fontSize:14,color:'var(--muted)',marginBottom:24}}>This quote will be archived.</p><div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setDelId(null)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={()=>del(delId)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'var(--status-danger)',border:'none',color:'#fff',fontFamily:'var(--font-ui)',fontWeight:600}}>Delete</button></div></div></div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px',overflowY:'auto'}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:700,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>{mode==='add'?'New Quote':mode==='edit'?'Edit Quote':`Quote ${form.quote_number}`}</h3><div style={{display:'flex',gap:8}}>{mode==='view'&&<button onClick={()=>setMode('edit')} style={{display:'flex',alignItems:'center',gap:6,background:'var(--accent-soft)',color:'var(--accent)',border:'none',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-ui)'}}><Edit size={14}/>Edit</button>}<button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div></div>
          <div style={{padding:28}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
              <div><label style={LS}>Quote Number</label><div style={{fontSize:14,fontWeight:600,fontFamily:'monospace',color:'var(--accent)'}}>{form.quote_number}</div></div>
              <div><label style={LS}>Client</label>{mode==='view'?<div style={{fontSize:14}}>{clientName(form.client_id)}</div>:<select style={IS} value={form.client_id||''} onChange={e=>setForm((p:any)=>({...p,client_id:e.target.value||null}))}><option value="">Select client</option>{clients.map(c=><option key={c.id} value={c.id}>{c.business_name}</option>)}</select>}</div>
              <div><label style={LS}>Status</label>{mode==='view'?<span style={{display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:12,fontWeight:600,textTransform:'capitalize',background:SC[form.status]?.bg||'#f5f5f5',color:SC[form.status]?.fg||'#666'}}>{form.status}</span>:<select style={IS} value={form.status} onChange={e=>setForm((p:any)=>({...p,status:e.target.value}))}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select>}</div>
            </div>

            {/* Line items */}
            <div style={{marginBottom:20}}>
              <label style={LS}>Line Items</label>
              <div style={{border:'1px solid var(--line)',borderRadius:8,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{background:'#FAFAF8',borderBottom:'1px solid var(--line)'}}>
                    <th style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,color:'var(--muted)'}}>Description</th>
                    <th style={{padding:'8px 12px',textAlign:'center',fontSize:10,fontWeight:700,color:'var(--muted)',width:60}}>Qty</th>
                    <th style={{padding:'8px 12px',textAlign:'right',fontSize:10,fontWeight:700,color:'var(--muted)',width:100}}>Rate</th>
                    <th style={{padding:'8px 12px',textAlign:'right',fontSize:10,fontWeight:700,color:'var(--muted)',width:100}}>Amount</th>
                    {mode!=='view'&&<th style={{width:40}}></th>}
                  </tr></thead>
                  <tbody>
                    {(form.items||[]).map((item:QuoteItem,idx:number)=>(<tr key={idx} style={{borderBottom:'1px solid var(--line)'}}>
                      <td style={{padding:'8px 12px'}}>{mode==='view'?item.description:<input style={{...IS,padding:'6px 8px',fontSize:13}} value={item.description} onChange={e=>updateItem(idx,'description',e.target.value)} placeholder="Service description"/>}</td>
                      <td style={{padding:'8px 12px',textAlign:'center'}}>{mode==='view'?item.qty:<input style={{...IS,padding:'6px 8px',fontSize:13,textAlign:'center'}} type="number" min="1" value={item.qty} onChange={e=>updateItem(idx,'qty',Number(e.target.value))}/>}</td>
                      <td style={{padding:'8px 12px',textAlign:'right'}}>{mode==='view'?fmtCur(item.rate):<input style={{...IS,padding:'6px 8px',fontSize:13,textAlign:'right'}} type="number" min="0" step="25" value={item.rate} onChange={e=>updateItem(idx,'rate',Number(e.target.value))}/>}</td>
                      <td style={{padding:'8px 12px',textAlign:'right',fontWeight:600}}>{fmtCur(item.amount)}</td>
                      {mode!=='view'&&<td style={{padding:'4px'}}>{form.items.length>1&&<button onClick={()=>removeItem(idx)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',padding:4}}><X size={14}/></button>}</td>}
                    </tr>))}
                  </tbody>
                </table>
                {mode!=='view'&&<div style={{padding:8}}><button onClick={addItem} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:12,fontFamily:'var(--font-ui)',fontWeight:600}}>+ Add Line Item</button></div>}
              </div>
            </div>

            {/* Totals */}
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:20}}>
              <div style={{width:260}}>
                <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:14}}><span style={{color:'var(--muted)'}}>Subtotal</span><span>{fmtCur(form.subtotal||0)}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:14,alignItems:'center'}}><span style={{color:'var(--muted)'}}>Discount</span>{mode==='view'?<span>{form.discount_pct||0}%</span>:<div style={{display:'flex',alignItems:'center',gap:4}}><input style={{...IS,width:60,padding:'4px 8px',fontSize:13,textAlign:'right'}} type="number" min="0" max="100" value={form.discount_pct||0} onChange={e=>setDiscount(Number(e.target.value))}/><span>%</span></div>}</div>
                <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',fontSize:18,fontWeight:600,borderTop:'2px solid var(--line)',marginTop:4}}><span>Total</span><span style={{color:'var(--accent)'}}>{fmtCur(form.total||0)}</span></div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Valid Until</label>{mode==='view'?<div style={{fontSize:14}}>{form.valid_until?fmtDate(form.valid_until):'—'}</div>:<input style={IS} type="date" value={form.valid_until||''} onChange={e=>setForm((p:any)=>({...p,valid_until:e.target.value||null}))}/>}</div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Notes</label>{mode==='view'?<div style={{fontSize:14,whiteSpace:'pre-wrap'}}>{form.notes||'—'}</div>:<textarea style={{...IS,minHeight:60,resize:'vertical'}} value={form.notes||''} onChange={e=>setForm((p:any)=>({...p,notes:e.target.value}))} placeholder="Terms, conditions, notes..."/>}</div>
          </div>
          {mode!=='view'&&<div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving?0.7:1}}>{saving?'Saving...':mode==='add'?'Create Quote':'Save Changes'}</button></div>}
        </div>
      </div>}
    </div>
  )
}
