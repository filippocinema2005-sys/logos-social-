import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Λόγος</h1>
      <p style={{ color: '#888', marginBottom: '3rem' }}>Benvenuto nel social dei filosofi</p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>

        <div onClick={() => navigate('/agora')} style={{
          background: '#1a1a1a', border: '1px solid #333',
          padding: '2rem', width: '120px', textAlign: 'center', cursor: 'pointer'
        }}>
          <p style={{ fontSize: '1.5rem' }}>🏛️</p>
          <p>Agorà</p>
        </div>

        <div onClick={() => navigate('/gruppi')} style={{
          background: '#1a1a1a', border: '1px solid #333',
          padding: '2rem', width: '120px', textAlign: 'center', cursor: 'pointer'
        }}>
          <p style={{ fontSize: '1.5rem' }}>👥</p>
          <p>Gruppi</p>
        </div>

        <div onClick={() => navigate('/symposium')} style={{
          background: '#1a1a1a', border: '1px solid #333',
          padding: '2rem', width: '120px', textAlign: 'center', cursor: 'pointer'
        }}>
          <p style={{ fontSize: '1.5rem' }}>📜</p>
          <p>Symposium</p>
        </div>

        <div onClick={() => navigate('/profilo')} style={{
          background: '#1a1a1a', border: '1px solid #333',
          padding: '2rem', width: '120px', textAlign: 'center', cursor: 'pointer'
        }}>
          <p style={{ fontSize: '1.5rem' }}>👤</p>
          <p>Profilo</p>
        </div>

      </div>

      <button onClick={handleLogout} style={{
        background: 'transparent', color: '#888',
        border: '1px solid #333', padding: '8px 24px',
        fontSize: '0.9rem', fontFamily: 'Georgia, serif', cursor: 'pointer'
      }}>
        Esci
      </button>
    </div>
  );
}

export default Home;