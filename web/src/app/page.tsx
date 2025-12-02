import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '2rem',
          borderRadius: '1rem',
          background: 'rgba(15,23,42,0.95)',
          boxShadow: '0 20px 40px rgba(15,23,42,0.7)',
        }}
      >
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>TilexCare</h1>
        <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>
          Secure telehealth platform connecting Ethiopian patients with verified healthcare
          specialists.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/auth/login">Sign in</Link>
          <Link href="/auth/register">Create account</Link>
        </div>
      </div>
    </main>
  );
}
