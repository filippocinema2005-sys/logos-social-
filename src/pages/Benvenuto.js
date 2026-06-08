// Importiamo useNavigate — ci permette di navigare tra le schermate
import { useNavigate } from 'react-router-dom';

// Benvenuto è la schermata iniziale che l'utente vede quando apre l'app
function Benvenuto() {
  
  // useNavigate ci dà una funzione per cambiare schermata
  const navigate = useNavigate();

  return (
    // Contenitore principale — sfondo scuro, tutto centrato
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
      
      {/* Titolo in greco — Λόγος */}
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Λόγος</h1>
      
      {/* Sottotitolo */}
      <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '3rem' }}>
        Il social network per filosofi
      </p>
      
      {/* Bottone Accedi — porta alla schermata di login */}
      <button
        onClick={() => navigate('/accedi')}
        style={{
          background: 'white',
          color: 'black',
          border: 'none',
          padding: '12px 32px',
          fontSize: '1rem',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          marginBottom: '1rem',
          width: '200px'
        }}>
        Accedi
      </button>
      
      {/* Bottone Registrati — porta alla schermata di registrazione */}
      <button
        onClick={() => navigate('/registrati')}
        style={{
          background: 'transparent',
          color: 'white',
          border: '1px solid #444',
          padding: '12px 32px',
          fontSize: '1rem',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          width: '200px'
        }}>
        Registrati
      </button>

    </div>
  );
}

export default Benvenuto;