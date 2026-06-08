// Importiamo gli strumenti necessari
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Accedi è la schermata di login
function Accedi() {

  // useNavigate per cambiare schermata dopo il login
  const navigate = useNavigate();

  // useState salva quello che l'utente scrive nei campi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Messaggio di errore da mostrare se il login fallisce
  const [errore, setErrore] = useState('');

  // Funzione che viene chiamata quando l'utente clicca "Accedi"
  const handleAccedi = async () => {
    
    // Proviamo a fare il login con Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    // Se c'è un errore, lo mostriamo
    if (error) {
      setErrore('Email o password errati. Riprova.');
    } else {
      // Se va bene, andiamo alla home (che costruiremo dopo)
      navigate('/home');
    }
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

      {/* Titolo */}
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Λόγος</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Accedi al tuo account</p>

      {/* Campo email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          color: 'white',
          padding: '12px 16px',
          fontSize: '1rem',
          fontFamily: 'Georgia, serif',
          width: '280px',
          marginBottom: '1rem'
        }}
      />

      {/* Campo password */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          color: 'white',
          padding: '12px 16px',
          fontSize: '1rem',
          fontFamily: 'Georgia, serif',
          width: '280px',
          marginBottom: '1rem'
        }}
      />

      {/* Messaggio di errore — appare solo se c'è un errore */}
      {errore && (
        <p style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {errore}
        </p>
      )}

      {/* Bottone login */}
      <button
        onClick={handleAccedi}
        style={{
          background: 'white',
          color: 'black',
          border: 'none',
          padding: '12px 32px',
          fontSize: '1rem',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          width: '280px',
          marginBottom: '1rem'
        }}>
        Accedi
      </button>

      {/* Link per andare alla registrazione */}
      <p
        onClick={() => navigate('/registrati')}
        style={{ color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>
        Non hai un account? Registrati
      </p>

    </div>
  );
}

export default Accedi;