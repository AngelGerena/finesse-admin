import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, X, Star, Eye, EyeOff } from 'lucide-react'

interface Testimonial { id:string; client_name:string; business_name:string|null; testimonial_text:string; rating:number|null; photo_url:string|null; published:boolean; display_order:number; created_at:string }
const EMPTY={client_name:'',business_name:null as string|null,testimonial_text:'',rating:5 as number|null,photo_url:null as string|null,published:false,display_order:0}

export default function Testimonials() {
  const [items,setItems]=useState<Testimonial[]>([]); const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false); const [mode,setMode]=useState<'add'|'edit'>('add')
  const [form,setForm]=useState<typeof EMPTY & {id?:string}>(EMPTY); const [saving,setSaving]=useState(false)

  async function load(){setLoading(true); const {data}=await supabase.from('testimonials').select('*').order('display_order'); if(data) setItems(data); setLoading(false)}
  useEffect(()=>{load()},[])

  function openAdd(){setForm({...EMPTY});setMode('add');setModal(true)}
  function openEdit(t:Testimonial){setForm({...t});setMode('edit');setModal(true)}

  async function save(){
    setSaving(true)
    const p={client_name:form.client_name,business_name:form.business_name||null,testimonial_text:form.testimonial_text,rating:form.rating,photo_url:form.photo_url||null,published:form.published,display_order:form.display_order}
    if(mode==='edit'&&form.id) await supabase.from('testimonials').update(p).eq('id',form.id)
    else await supabase.from('testimonials').insert(p)
    setSaving(false);setModal(false);load()
  }

  async function togglePublish(id:string,current:boolean){await supabase.from('testimonials').update({published:!current}).eq('id',id);load()}
  async function del(id:string){await supabase.from('testimonials').delete().eq('id',id);load()}
  function set(k:string,v:string|number|boolean|null){setForm(p=>({...p,[k]:v}))}

  const IS={width:'100%',padding:'10px 14px',fontFamily:'var(--font-ui)',fontSize:14,background:'#FAFAF8',border:'1px solid var(--line)',borderRadius:8,color:'var(--text)',outline:'none',boxSizing:'border-box' as const}
  const LS={display:'block' as const,fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--muted)',marginBottom:6}

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Testimonials</h2>
        <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',color:'var(--brand)',border:'none',borderRadius:10,padding:'10px 20px',fontSize:13,fontWeight:600,fontFamily:'var(--font-ui)',cursor:'pointer'}}><Plus size={16}/>Add Testimonial</button>
      </div>

      {loading?<div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>Loading...</div>:
      items.length===0?<div style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',padding:40,textAlign:'center',color:'var(--muted)'}}>No testimonials yet.</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
        {items.map(t=>(<div key={t.id} style={{background:'#fff',borderRadius:12,border:'1px solid var(--line)',padding:24,position:'relative'}}>
          <div style={{position:'absolute',top:12,right:12,display:'flex',gap:4}}>
            <button onClick={()=>togglePublish(t.id,t.published)} title={t.published?'Unpublish':'Publish'} style={{background:'none',border:'none',cursor:'pointer',color:t.published?'var(--status-success)':'var(--muted)',padding:4}}>{t.published?<Eye size={16}/>:<EyeOff size={16}/>}</button>
          </div>
          <div style={{display:'flex',gap:2,marginBottom:12}}>{Array.from({length:5}).map((_,i)=>(<Star key={i} size={16} fill={i<(t.rating||0)?'#C5A44B':'none'} color={i<(t.rating||0)?'#C5A44B':'var(--line)'}/>))}</div>
          <p style={{fontSize:14,color:'var(--text)',lineHeight:1.7,fontStyle:'italic',marginBottom:16}}>"{t.testimonial_text}"</p>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'var(--accent-soft)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'var(--accent)'}}>{t.client_name.charAt(0)}</div>
            <div><div style={{fontSize:14,fontWeight:600}}>{t.client_name}</div>{t.business_name&&<div style={{fontSize:12,color:'var(--muted)'}}>{t.business_name}</div>}</div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:16,borderTop:'1px solid var(--line)',paddingTop:12}}>
            <button onClick={()=>openEdit(t)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--accent)',fontSize:12,fontFamily:'var(--font-ui)'}}>Edit</button>
            <button onClick={()=>del(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--status-danger)',fontSize:12,fontFamily:'var(--font-ui)'}}>Delete</button>
            <span style={{marginLeft:'auto',fontSize:11,color:'var(--muted)'}}>{t.published?'Published':'Draft'}</span>
          </div>
        </div>))}
      </div>}

      {modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setModal(false)}>
        <div style={{background:'#fff',borderRadius:16,width:500,maxWidth:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:'20px 28px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between'}}><h3 style={{fontSize:18,fontFamily:'var(--font-display)',fontWeight:600,margin:0}}>{mode==='add'?'Add Testimonial':'Edit Testimonial'}</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:4}}><X size={20}/></button></div>
          <div style={{padding:28}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Client Name *</label><input style={IS} value={form.client_name} onChange={e=>set('client_name',e.target.value)} placeholder="Client name"/></div>
              <div><label style={LS}>Business Name</label><input style={IS} value={form.business_name||''} onChange={e=>set('business_name',e.target.value||null)} placeholder="Business name"/></div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Testimonial *</label><textarea style={{...IS,minHeight:100,resize:'vertical'}} value={form.testimonial_text} onChange={e=>set('testimonial_text',e.target.value)} placeholder="What did they say?"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              <div><label style={LS}>Rating</label><div style={{display:'flex',gap:4}}>{Array.from({length:5}).map((_,i)=>(<Star key={i} size={24} fill={i<(form.rating||0)?'#C5A44B':'none'} color={i<(form.rating||0)?'#C5A44B':'var(--line)'} style={{cursor:'pointer'}} onClick={()=>set('rating',i+1)}/>))}</div></div>
              <div><label style={LS}>Display Order</label><input style={IS} type="number" min="0" value={form.display_order} onChange={e=>set('display_order',Number(e.target.value))}/></div>
            </div>
            <label style={{...LS,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} style={{accentColor:'var(--accent)'}}/> Publish to website</label>
          </div>
          <div style={{padding:'16px 28px',borderTop:'1px solid var(--line)',display:'flex',gap:10,justifyContent:'flex-end'}}><button onClick={()=>setModal(false)} style={{padding:'10px 20px',borderRadius:8,fontSize:13,cursor:'pointer',background:'none',border:'1px solid var(--line)',color:'var(--text)',fontFamily:'var(--font-ui)'}}>Cancel</button><button onClick={save} disabled={saving||!form.client_name||!form.testimonial_text} style={{padding:'10px 24px',borderRadius:8,fontSize:13,cursor:saving?'wait':'pointer',background:'linear-gradient(135deg,var(--accent),var(--accent-deep))',border:'none',color:'var(--brand)',fontWeight:600,fontFamily:'var(--font-ui)',opacity:saving||!form.client_name||!form.testimonial_text?0.7:1}}>{saving?'Saving...':mode==='add'?'Add Testimonial':'Save Changes'}</button></div>
        </div>
      </div>}
    </div>
  )
}
