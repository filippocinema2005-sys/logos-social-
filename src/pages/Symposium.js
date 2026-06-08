// Importiamo gli strumenti necessari
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Symposium è la sezione per pubblicare e leggere paper filosofici
function Symposium() {

  const navigate = useNavigate();

  // Lista dei paper caricati dal database
  const [papers, setPapers] = useState([]);

  // Utente loggato
  const [utente, setUtente] = useState(null);

  // Stato per mostrare o nascondere il form di pubblicazione
  const [mostraForm, setMostraForm] = useState(false);

  // Dati del nuovo paper
  const [titolo, setTitolo] = useState('');
  const [abstract, setAbstract] = useState('');
  const [contenuto, setContenuto] = useState('');

  // Carichiamo tutto quando la pagina si apre
  useEffect(() => {
    caricaUtente();
    caricaPapers();
  }, []);

  // Funzione che carica l'utente loggato
  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
  };

  // Funzione che carica tutti i paper dal database
  const caricaPapers = async () => {
    const { data, error } = await supabase
      .from('paper')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setPapers(data);
    }
  };

  // Funzione che pubblica un nuovo paper
  const pubblicaPaper = async () => {
    if (!titolo.trim() || !abstract.trim() || !contenuto.trim()) return;

    const { error } = await supabase
      .from('paper')
      .insert({
        titolo: titolo,
        abstract: abstract,
        contenuto: contenuto,
        user_id: utente.id,
        stato: 'in_revisione'
      });

    if (!error) {
      setTitolo('');
      setAbstract('');
      setContenuto('');
      setMostraForm(false);
      caricaPapers();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: 'Georgia, serif',
      color: 'white',
      maxWidth: '750px',
      margin: '0 auto',
      padding: '2rem'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Symposium</h1>
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

      {/* Bottone per pubblicare un paper */}
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
        + Pubblica paper
      </button>

      {/* Form per pubblicare un paper */}
      {mostraForm && (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>

          {/* Titolo */}
          <input
            type="text"
            placeholder="Titolo del paper"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
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

          {/* Abstract */}
          <textarea
            placeholder="Abstract — breve descrizione del paper"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              color: 'white',
              padding: '10px',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              resize: 'vertical',
              minHeight: '80px',
              marginBottom: '1rem'
            }}
          />

          {/* Contenuto */}
          <textarea
            placeholder="Testo completo del paper..."
            value={contenuto}
            onChange={(e) => setContenuto(e.target.value)}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              color: 'white',
              padding: '10px',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              resize: 'vertical',
              minHeight: '200px',
              marginBottom: '1rem'
            }}
          />

          <button
            onClick={pubblicaPaper}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              padding: '10px 24px',
              fontFamily: 'Georgia, serif',
              cursor: 'pointer'
            }}>
            Pubblica
          </button>
        </div>
      )}

      {/* Lista dei paper */}
      {papers.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>
          Nessun paper ancora. Sii il primo a pubblicare.
        </p>
      ) : (
        papers.map((paper) => (
          <div key={paper.id} style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            {/* Titolo del paper */}
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{paper.titolo}</h2>
            
            {/* Stato del paper — in revisione o pubblicato */}
            <span style={{
              background: paper.stato === 'pubblicato' ? '#1a3a1a' : '#3a2a1a',
              color: paper.stato === 'pubblicato' ? '#44ff88' : '#ffaa44',
              padding: '2px 10px',
              fontSize: '0.75rem',
              marginBottom: '1rem',
              display: 'inline-block'
            }}>
              {paper.stato === 'pubblicato' ? 'Pubblicato' : 'In revisione'}
            </span>

            {/* Abstract */}
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
              {paper.abstract}
            </p>

            {/* Data */}
            <p style={{ color: '#555', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {new Date(paper.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>
        ))
      )}

    </div>
  );
}

export default Symposium;