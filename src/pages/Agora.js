// Importiamo gli strumenti necessari
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Agora è la schermata dei post brevi filosofici
function Agora() {

  const navigate = useNavigate();

  // Lista dei post caricati dal database
  const [posts, setPosts] = useState([]);
  
  // Testo del nuovo post che l'utente sta scrivendo
  const [nuovoPost, setNuovoPost] = useState('');
  
  // Utente attualmente loggato
  const [utente, setUtente] = useState(null);

  // useEffect viene eseguito quando la pagina si carica
  useEffect(() => {
    // Carichiamo l'utente loggato e i post esistenti
    caricaUtente();
    caricaPosts();
  }, []);

  // Funzione che prende l'utente loggato da Supabase
  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
  };

  // Funzione che carica tutti i post dal database
  const caricaPosts = async () => {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .order('created_at', { ascending: false }); // Dal più recente al più vecchio

    if (!error) {
      setPosts(data);
    }
  };

  // Funzione che pubblica un nuovo post
  const pubblicaPost = async () => {
    
    // Controlliamo che il post non sia vuoto
    if (!nuovoPost.trim()) return;
    
    // Controlliamo che il post non superi 280 caratteri
    if (nuovoPost.length > 280) return;

    // Salviamo il post nel database
    const { error } = await supabase
      .from('post')
      .insert({
        contenuto: nuovoPost,
        user_id: utente.id
      });

    if (!error) {
      // Svuotiamo il campo di testo e ricarichiamo i post
      setNuovoPost('');
      caricaPosts();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: 'Georgia, serif',
      color: 'white',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem'
    }}>

      {/* Header con titolo e bottone per tornare alla home */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Agorà</h1>
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

      {/* Area per scrivere un nuovo post */}
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <textarea
          placeholder="Condividi un pensiero filosofico..."
          value={nuovoPost}
          onChange={(e) => setNuovoPost(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            resize: 'none',
            outline: 'none',
            minHeight: '80px'
          }}
        />
        
        {/* Contatore caratteri e bottone pubblica */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <span style={{ color: nuovoPost.length > 280 ? '#ff4444' : '#888', fontSize: '0.9rem' }}>
            {nuovoPost.length}/280
          </span>
          <button
            onClick={pubblicaPost}
            style={{
              background: 'white',
              color: 'black',
              border: 'none',
              padding: '8px 24px',
              fontFamily: 'Georgia, serif',
              cursor: 'pointer'
            }}>
            Pubblica
          </button>
        </div>
      </div>

      {/* Lista dei post */}
      {posts.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>
          Nessun post ancora. Sii il primo a condividere un pensiero.
        </p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{post.contenuto}</p>
            <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {new Date(post.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>
        ))
      )}

    </div>
  );
}

export default Agora;