export default function RegisterPage() {
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
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Create your account</h1>
        <p style={{ marginBottom: '1.5rem', color: '#9ca3af' }}>
          Patient and doctor onboarding flows will be implemented here.
        </p>
      </div>
    </main>
  );
}
