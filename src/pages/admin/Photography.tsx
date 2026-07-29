export default function Photography() {
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
        <h2 style={{fontFamily:'var(--font-display)',fontSize:28,fontWeight:300,color:'var(--text)',margin:0}}>Photography Manager</h2>
      </div>
      <div style={{background:'#fff',border:'1px solid var(--line)',borderRadius:12,padding:40,textAlign:'center'}}>
        <div style={{fontSize:14,color:'var(--muted)',marginBottom:8}}>Photography Manager</div>
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7,maxWidth:400,margin:'0 auto'}}>
          This module will manage your photography gallery categories (Weddings, Couples, Family, Maternity, Sweet 15) with Supabase Storage for image uploads. Coming in the next build session.
        </p>
      </div>
    </div>
  )
}
