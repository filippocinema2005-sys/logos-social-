import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Accedi() {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');

  const handleAccedi = async () => {
    if (!email || !password) {
      setErrore('Compila tutti i campi.');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrore('Email o password errati.');
    } else {
      navigate('/agora');
    }
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: '#141414',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
      color: '#e8e8e8',
      padding: '24px'
    },
    logo: {
      fontFamily: "'Space Mono', monospace",
      fontSize: '28px',
      fontWeight: 700,
      letterSpacing: '0.15em',
      color: '#fff',
      marginBottom: '8px'
    },
    sub: {
      fontSize: '11px',
      color: '#555',
      fontFamily: "'Space Mono', monospace",
      letterSpacing: '0.12em',
      marginBottom: '48px'
    },
    input: {
      width: '100%',
      maxWidth: '320px',
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      color: '#e8e8e8',
      padding: '12px 14px',
      fontSize: '14px',
      fontFamily: "'Space Grotesk', sans-serif",
      outline: 'none',
      borderRadius: '2px',
      marginBottom: '12px'
    },
    btnPrimary: {
      width: '100%',
      maxWidth: '320px',
      background: '#F5D90A',
      color: '#141414',
      border: 'none',
      padding: '12px',
      fontSize: '13px',
      fontWeight: 700,
      fontFamily: "'Space Mono', monospace",
      cursor: 'pointer',
      borderRadius: '2px',
      letterSpacing: '0.08em',
      marginBottom: '12px'
    },
    btnSecondary: {
      background: 'transparent',
      color: '#555',
      border: 'none',
      fontSize: '12px',
      fontFamily: "'Space Mono', monospace",
      cursor: 'pointer',
      letterSpacing: '0.06em'
    }
  };

  return (
    <div style={s.page}>
      <div style={s.logo}>
        Λ<span style={{ color: '#F5D90A' }}>Ο</span>ΓΟΣ
      </div>
      <p style={s.sub}>_ accedi al tuo account</p>

      <input
        style={s.input}
        type="email"
        placeholder="_ email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={s.input}
        type="password"
        placeholder="_ password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAccedi(); }}
      />

      {errore && (
        <p style={{ color: '#ff4444', fontSize: '12px', fontFamily: "'Space Mono', monospace", marginBottom: '12px', maxWidth: '320px', textAlign: 'center' }}>
          {errore}
        </p>
      )}

      <button style={s.btnPrimary} onClick={handleAccedi}>
        Accedi
      </button>
      <button style={s.btnSecondary} onClick={() => navigate('/registrati')}>
        Non hai un account? Registrati →
      </button>
    </div>
  );
}

export default Accedi;