import { useNavigate } from 'react-router-dom';

function Benvenuto() {

  const navigate = useNavigate();

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
      fontSize: '36px',
      fontWeight: 700,
      letterSpacing: '0.2em',
      color: '#fff',
      marginBottom: '8px'
    },
    sub: {
      fontSize: '11px',
      color: '#555',
      fontFamily: "'Space Mono', monospace",
      letterSpacing: '0.15em',
      marginBottom: '64px',
      textTransform: 'uppercase'
    },
    btnPrimary: {
      width: '100%',
      maxWidth: '320px',
      background: '#F5D90A',
      color: '#141414',
      border: 'none',
      padding: '14px',
      fontSize: '13px',
      fontWeight: 700,
      fontFamily: "'Space Mono', monospace",
      cursor: 'pointer',
      borderRadius: '2px',
      letterSpacing: '0.08em',
      marginBottom: '12px'
    },
    btnSecondary: {
      width: '100%',
      maxWidth: '320px',
      background: 'transparent',
      color: '#e8e8e8',
      border: '1px solid #2a2a2a',
      padding: '14px',
      fontSize: '13px',
      fontFamily: "'Space Mono', monospace",
      cursor: 'pointer',
      borderRadius: '2px',
      letterSpacing: '0.08em',
      marginBottom: '40px'
    },
    footer: {
      fontSize: '10px',
      color: '#333',
      fontFamily: "'Space Mono', monospace",
      letterSpacing: '0.08em',
      textAlign: 'center'
    }
  };

  return (
    <div style={s.page}>

      <div style={s.logo}>
        Λ<span style={{ color: '#F5D90A' }}>Ο</span>ΓΟΣ
      </div>
      <p style={s.sub}>The Philosophical High</p>

      <button style={s.btnPrimary} onClick={() => navigate('/accedi')}>
        Accedi
      </button>
      <button style={s.btnSecondary} onClick={() => navigate('/registrati')}>
        Registrati
      </button>

      <p style={s.footer}>
        _ il social network per filosofi
      </p>

    </div>
  );
}

export default Benvenuto;