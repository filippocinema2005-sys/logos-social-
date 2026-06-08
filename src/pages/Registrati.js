// Importiamo gli strumenti necessari
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Registrati è la schermata di registrazione
function Registrati() {

  // useNavigate per cambiare schermata dopo la registrazione
  const navigate = useNavigate();

  // useState salva quello che l'utente scrive nei campi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');

  // Messaggio di errore o successo
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  // Funzione chiamata quando l'utente clicca "Registrati"
  const handleRegistrati = async () => {

    // Controlliamo che i campi non siano vuoti
    if (!email || !password || !nome) {
      setErrore('Compila tutti i campi.');
      return;
    }

    // Proviamo a creare l'account con Supabase
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          // Salviamo il nome insieme all'account
          nome: nome
        }
      }
    });

    // Se c'è un errore, lo mostriamo
    if (error) {
      setErrore('Errore durante la registrazione: ' + error.message);
    } else {
      // Se va bene, mostriamo un messaggio di conferma
      setSuccesso('Account creato! Controlla la tua email per confermare.');
      setErrore('');
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
      <p style={{ color: '#888', marginBottom: '2rem' }}>Crea il tuo account</p>

      {/* Campo nome */}
      <input
        type="text"
        placeholder="Nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
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

      {/* Messaggio di errore */}
      {errore && (
        <p style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {errore}
        </p>
      )}

      {/* Messaggio di successo */}
      {successo && (
        <p style={{ color: '#44ff88', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {successo}
        </p>
      )}

      {/* Bottone registrazione */}
      <button
        onClick={handleRegistrati}
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
        Registrati
      </button>

      {/* Link per andare al login */}
      <p
        onClick={() => navigate('/accedi')}
        style={{ color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}>
        Hai già un account? Accedi
      </p>

    </div>
  );
}

export default Registrati;