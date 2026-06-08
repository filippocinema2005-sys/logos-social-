/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supabase';

// Gruppo è la pagina interna di un singolo gruppo — contiene la chat
function Gruppo() {

  const navigate = useNavigate();
  
  // useParams legge l'ID del gruppo dall'URL
  const { id } = useParams();

  // Dati del gruppo corrente
  const [gruppo, setGruppo] = useState(null);
  
  // Lista dei messaggi della chat
  const [messaggi, setMessaggi] = useState([]);
  
  // Testo del messaggio che l'utente sta scrivendo
  const [nuovoMessaggio, setNuovoMessaggio] = useState('');
  
  // Utente loggato
  const [utente, setUtente] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  caricaUtente();
  caricaGruppo();
  caricaMessaggi();
}, [id]);

  // Funzione che carica l'utente loggato
  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
  };

  // Funzione che carica i dati del gruppo
  const caricaGruppo = async () => {
    const { data, error } = await supabase
      .from('gruppi')
      .select('*')
      .eq('id', id) // Filtriamo per l'ID del gruppo nell'URL
      .single();

    if (!error) {
      setGruppo(data);
    }
  };

  // Funzione che carica i messaggi di questo gruppo
  const caricaMessaggi = async () => {
    const { data, error } = await supabase
      .from('messaggi')
      .select('*')
      .eq('gruppo_id', id) // Solo i messaggi di questo gruppo
      .order('created_at', { ascending: true }); // Dal più vecchio al più recente

    if (!error) {
      setMessaggi(data);
    }
  };

  // Funzione che invia un nuovo messaggio
  const inviaMessaggio = async () => {
    if (!nuovoMessaggio.trim()) return;

    const { error } = await supabase
      .from('messaggi')
      .insert({
        contenuto: nuovoMessaggio,
        user_id: utente.id,
        gruppo_id: id
      });

    if (!error) {
      setNuovoMessaggio('');
      caricaMessaggi();
    }
  };

  // Funzione per inviare il messaggio anche premendo Invio
  const handleTasto = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inviaMessaggio();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: 'Georgia, serif',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Header con nome gruppo e bottone per tornare */}
      <div style={{
        background: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.4rem' }}>
          {gruppo ? gruppo.nome : 'Caricamento...'}
        </h1>
        <button
          onClick={() => navigate('/gruppi')}
          style={{
            background: 'transparent',
            color: '#888',
            border: '1px solid #333',
            padding: '6px 16px',
            fontFamily: 'Georgia, serif',
            cursor: 'pointer'
          }}>
          ← Gruppi
        </button>
      </div>

      {/* Descrizione del gruppo */}
      {gruppo && gruppo.descrizione && (
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #222', color: '#888', fontSize: '0.9rem' }}>
          {gruppo.descrizione}
        </div>
      )}

      {/* Area messaggi — scorre verso il basso */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messaggi.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
            Nessun messaggio ancora. Inizia la discussione!
          </p>
        ) : (
          messaggi.map((msg) => (
            <div key={msg.id} style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, lineHeight: '1.6' }}>{msg.contenuto}</p>
              <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                {new Date(msg.created_at).toLocaleString('it-IT')}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Area per scrivere un messaggio — fissa in basso */}
      <div style={{
        borderTop: '1px solid #333',
        padding: '1rem 2rem',
        display: 'flex',
        gap: '1rem',
        background: '#0f0f0f'
      }}>
        <input
          type="text"
          placeholder="Scrivi un messaggio... (Invio per inviare)"
          value={nuovoMessaggio}
          onChange={(e) => setNuovoMessaggio(e.target.value)}
          onKeyDown={handleTasto}
          style={{
            flex: 1,
            background: '#1a1a1a',
            border: '1px solid #333',
            color: 'white',
            padding: '10px 16px',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem'
          }}
        />
        <button
          onClick={inviaMessaggio}
          style={{
            background: 'white',
            color: 'black',
            border: 'none',
            padding: '10px 24px',
            fontFamily: 'Georgia, serif',
            cursor: 'pointer'
          }}>
          Invia
        </button>
      </div>

    </div>
  );
}

export default Gruppo;