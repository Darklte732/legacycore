
export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        LegacyCore Application
      </h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center', marginBottom: '2rem' }}>
        Successfully deployed to Vercel! The full application will be available soon.
      </p>
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '0.5rem',
        maxWidth: '600px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Deployment Status</h2>
        <p style={{ marginBottom: '1rem' }}>
          This is a minimal landing page created for the initial Vercel deployment. 
          The complete application with all features will be deployed in the next phase.
        </p>
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#d1e7dd', 
          color: '#0f5132',
          borderRadius: '0.25rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ✅ Deployment Successful
        </div>
      </div>
    </div>
  );
}