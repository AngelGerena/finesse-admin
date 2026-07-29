import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface PlannerEvent { id:string; title:string; description:string|null; event_date:string; event_time:string|null; event_type:string; client_id:string|null; project_id:string|null; completed:boolean; created_at:string }
interface Opt { id:string; name:string }

const TYPES=['task','meeting','deadline','reminder','shoot','other']
const TC:Record<string,string>={task:'#C5A44B',meeting:'#2B6CB0',deadline:'#C53030',reminder:'#B8860B',shoot:'#2D8A54',other:'#666'}
const EMPTY={title:'',description:null as string|null,event_date:new Date().toISOString().split('T')[0],event_time:null as string|null,event_type:'task',client_id:null as string|null,project_id:null as string|null,completed:false}

export default function Planner() {
  const [events,setEvents]=useState<PlannerEvent[]>([]); const [clients,setClients]=useState<Opt[]>([]); const [projects,setProjects]=useState<Opt[]>([])
  const [,setLoading]=useState(true); const [modal,setModal]=useState(false); const [saving,setSaving]=useState(false)
  const [form,setForm]=useState<typeof EMPTY>(EMPTY)
  const [viewDate,setViewDate]=useState(new Date())

  const year=viewDate.getFullYear(),month=viewDate.getMonth()
  const firstDay=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const monthLabel=viewDate.toLocaleDateString('en-US',{month:'long',year:'numeric'})

  async function load(){
    setLoading(true)
    const start=new Date(year,month,1).toISOString().split('T')[0]
    const end=new Date(year,month+1,0).toISOString().split('T')[0]
    const [{data:ev},{data:cl},{data:pr}]=await Promise.all([
      supabase.from('planner_events').select('*').gte('event_date',start).lte('event_date',end).order('event_date'),
      supabase.from('clients').select('id,business_name').is('deleted_at',null),
      supabase.from('projects').select('id,project_name').is('deleted_at',null)
    ])
    if(ev) setEvents(ev); if(cl) setClients(cl.map(c=>({id:c.id,name:c.business_name}))); if(pr) setProjects(pr.map(p=>({id:p.id,name:p.project_name})))
    setLoading(false)
  }
  useEffect(()=>{load()},[month,year])

  function prevMonth(){setViewDate(new Date(year,month-1,1))}
  function nextMonth(){setViewDate(new Date(year,month+1,1))}
  function eventsForDay(day:number){const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; return events.filter(e=>e.event_date===ds)}

  async function toggleComplete(id:string,current:boolean){
    await supabase.from('planner_events').update({completed:!current}).eq('id',id); load()
  }

  async function save(){
    setSaving(true)
    await supabase.from('planner_events').insert(form)
    setSaving(false);setModal(false);setForm({...EMPTY,event_date:new Date().toISOString().split('T')[0]});load()
  }

  function openAdd(day?:number){
    const d=day?`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`:new Date().toISOString().split('T')[0]
    setForm({...EMPTY,event_date:d});setModal(true)
  }

  function set(k:string,v:string|boolean|null){setForm(p=>({...p,[k]:v}))}
  const today=new Date(); const isToday=(d:number)=>d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button onClick={prevMonth} style={{background:'none',border:'1px solid var(--line)',borderRadius:8,padding:6,cursor:'pointer',color:'var(--muted)',display:'flex'}}><ChevronLeft size={18}/></button>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0,minWidth:220,textAlign:'center'}}>{monthLabel}</h2>
          <button onClick={nextMonth} style={{background:'none',border:'1px solid var(--line)',borderRadius:8,padding:6,cursor:'pointer',color:'var(--muted)',display:'flex'}}><ChevronRight size={18}/></button>
        </div>
        <button onClick={()=>openAdd()} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>Add Event</button>
      </div>

      <div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(<div key={d} style={{padding:'12px',textAlign:'center',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--muted)',borderBottom:'1px solid var(--line)',background:'#FAFAF8'}}>{d}</div>))}
          {Array.from({length:firstDay}).map((_,i)=>(<div key={`e${i}`} style={{minHeight:100,borderBottom:'1px solid var(--line)',borderRight:'1px solid var(--line)',background:'#FAFAF8'}}/>))}
          {Array.from({length:daysInMonth}).map((_,i)=>{
            const day=i+1; const dayEvents=eventsForDay(day)
            return (<div key={day} onClick={()=>openAdd(day)} style={{minHeight:100,padding:6,borderBottom:'1px solid var(--line)',borderRight:'1px solid var(--line)',cursor:'pointer',background:isToday(day)?'rgba(197,164,75,0.06)':'transparent',transition:'background 0.15s'}} onMouseOver={e=>{if(!isToday(day))e.currentTarget.style.background='#FAFAF8'}} onMouseOut={e=>{if(!isToday(day))e.currentTarget.style.background='transparent'}}>
              <div style={{fontSize:13,fontWeight:isToday(day)?700:400,color:isToday(day)?'var(--accent)':'var(--text)',marginBottom:4}}>{day}</div>
              {dayEvents.map(ev=>(<div key={ev.id} onClick={e=>{e.stopPropagation();toggleComplete(ev.id,ev.completed)}} style={{fontSize:11,padding:'2px 6px',borderRadius:4,marginBottom:2,background:`${TC[ev.event_type]||'#666'}15`,borderLeft:`3px solid ${TC[ev.event_type]||'#666'}`,color:ev.completed?'var(--muted)':'var(--text)',textDecoration:ev.completed?'line-through':'none',cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
                {ev.completed&&<Check size={10}/>}{ev.title}
              </div>))}
            </div>)
          })}
        </div>
      </div>

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:500,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>Add Event</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div>
          <div style={{padding:28}}>
            <div style={{marginBottom:16}}><label style={LS}>Title</label><input style={IS} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Event title"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Date</label><input style={IS} type="date" value={form.event_date} onChange={e=>set('event_date',e.target.value)}/></div>
              <div><label style={LS}>Time</label><input style={IS} type="time" value={form.event_time||''} onChange={e=>set('event_time',e.target.value||null)}/></div>
              <div><label style={LS}>Type</label><select style={IS} value={form.event_type} onChange={e=>set('event_type',e.target.value)}>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Client</label><select style={IS} value={form.client_id||''} onChange={e=>set('client_id',e.target.value||null)}><option value="">None</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label style={LS}>Project</label><select style={IS} value={form.project_id||''} onChange={e=>set('project_id',e.target.value||null)}><option value="">None</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Description</label><textarea style={{...IS,minHeight:60,resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Optional details..."/></div>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.title} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.title?0.7:1}}>{saving?'Saving...':'Add Event'}</button></div>
        </div>
      </div>}
    </div>
  )
}
