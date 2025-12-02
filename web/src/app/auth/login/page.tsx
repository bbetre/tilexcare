export default function LoginPage() {
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
          maxWidth: 420,
          width: '100%',
          padding: '2rem',
          borderRadius: '1rem',
          background: 'rgba(15,23,42,0.95)',
          boxShadow: '0 20px 40px rgba(15,23,42,0.7)',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Sign in</h1>
        <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>
          Authentication UI and integration with the TilexCare API will be wired up next.
        </p>
      </div>
    </main>
  );
}
