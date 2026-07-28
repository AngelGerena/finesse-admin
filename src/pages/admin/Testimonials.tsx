export default function Testimonials() {
  return (
    <div>
      <div style={{
        background: 'var(--surface-card)', border: '1px solid var(--line)',
        borderRadius: 12, padding: 40, textAlign: 'center'
      }}>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>Module</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', margin: 0 }}>
          Testimonials
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
          This module is ready to build. Database table and RLS policies are in place.
        </p>
      </div>
    </div>
  )
}
