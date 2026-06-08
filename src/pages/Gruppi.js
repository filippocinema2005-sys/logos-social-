// Importiamo gli strumenti necessari
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Gruppi è la schermata delle community tematiche
function Gruppi() {

  const navigate = useNavigate();

  // Lista dei gruppi caricati dal database
  const [gruppi, setGruppi] = useState([]);

  // Stato per mostrare o nascondere il form di creazione
  const [mostraForm, setMostraForm] = useState(false);

  // Dati del nuovo gruppo che l'utente sta creando
  const [nomeGruppo, setNomeGruppo] = useState('');
  const [descrizioneGruppo, setDescrizioneGruppo] = useState('');

  // Carichiamo i gruppi quando la pagina si apre
  useEffect(() => {
    caricaGruppi();
  }, []);

  // Funzione che carica tutti i gruppi dal database
  const caricaGruppi = async () => {
    const { data, error } = await supabase
      .from('gruppi')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setGruppi(data);
    }
  };

  // Funzione che crea un nuovo gruppo
  const creaGruppo = async () => {
    if (!nomeGruppo.trim()) return;

    const { error } = await supabase
      .from('gruppi')
      .insert({
        nome: nomeGruppo,
        descrizione: descrizioneGruppo
      });

    if (!error) {
      setNomeGruppo('');
      setDescrizioneGruppo('');
      setMostraForm(false);
      caricaGruppi();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: 'Georgia, serif',
      color: 'white',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '2rem'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Gruppi</h1>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'transparent',
            color: '#888',
            border: '1px solid #333',
            padding: '6px 16px',
            fontFamily: 'Georgia, serif',
            cursor: 'pointer'
          }}>
          ← Home
        </button>
      </div>

      {/* Bottone per creare un nuovo gruppo */}
      <button
        onClick={() => setMostraForm(!mostraForm)}
        style={{
          background: 'white',
          color: 'black',
          border: 'none',
          padding: '10px 24px',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}>
        + Crea gruppo
      </button>

      {/* Form per creare un nuovo gruppo — appare solo se mostraForm è true */}
      {mostraForm && (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <input
            type="text"
            placeholder="Nome del gruppo (es. Heidegger, Etica, Filosofia antica...)"
            value={nomeGruppo}
            onChange={(e) => setNomeGruppo(e.target.value)}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              color: 'white',
              padding: '10px',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          />
          <input
            type="text"
            placeholder="Descrizione (opzionale)"
            value={descrizioneGruppo}
            onChange={(e) => setDescrizioneGruppo(e.target.value)}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              color: 'white',
              padding: '10px',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}
          />
          <button
            onClick={creaGruppo}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              padding: '8px 24px',
              fontFamily: 'Georgia, serif',
              cursor: 'pointer'
            }}>
            Crea
          </button>
        </div>
      )}

      {/* Lista dei gruppi */}
      {gruppi.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>
          Nessun gruppo ancora. Creane uno!
        </p>
      ) : (
        gruppi.map((gruppo) => (
          <div
            key={gruppo.id}
            onClick={() => navigate(`/gruppi/${gruppo.id}`)}
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              padding: '1.5rem',
              marginBottom: '1rem',
              cursor: 'pointer'
            }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{gruppo.nome}</h2>
            {gruppo.descrizione && (
              <p style={{ color: '#888', fontSize: '0.9rem' }}>{gruppo.descrizione}</p>
            )}
          </div>
        ))
      )}

    </div>
  );
}

export default Gruppi;