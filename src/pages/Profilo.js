/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Profilo è la schermata dell'identità filosofica dell'utente
function Profilo() {

  const navigate = useNavigate();

  // Utente loggato
  const [utente, setUtente] = useState(null);

  // Dati del profilo
  const [profilo, setProfilo] = useState(null);

  // Modalità modifica
  const [modifica, setModifica] = useState(false);

  // Campi del profilo
  const [nome, setNome] = useState('');
  const [autori, setAutori] = useState('');
  const [corrente, setCorrente] = useState('');
  const [tesi, setTesi] = useState('');
  const [bio, setBio] = useState('');

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  caricaUtente();
}, []);

  // Funzione che carica l'utente e il suo profilo
  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
    if (user) {
      caricaProfilo(user.id);
    }
  };

  // Funzione che carica il profilo dal database
  const caricaProfilo = async (userId) => {
    const { data, error } = await supabase
      .from('profili')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProfilo(data);
      // Precompiliamo i campi con i dati esistenti
      setNome(data.nome || '');
      setAutori(data.autori_preferiti || '');
      setCorrente(data.corrente_filosofica || '');
      setTesi(data.tesi_in_corso || '');
      setBio(data.bio || '');
    }
  };

  // Funzione che salva il profilo
  const salvaProfilo = async () => {
    
    // Se il profilo esiste già lo aggiorniamo, altrimenti lo creiamo
    if (profilo) {
      const { error } = await supabase
        .from('profili')
        .update({
          nome, 
          autori_preferiti: autori,
          corrente_filosofica: corrente,
          tesi_in_corso: tesi,
          bio
        })
        .eq('user_id', utente.id);

      if (!error) {
        setModifica(false);
        caricaProfilo(utente.id);
      }
    } else {
      const { error } = await supabase
        .from('profili')
        .insert({
          user_id: utente.id,
          nome,
          autori_preferiti: autori,
          corrente_filosofica: corrente,
          tesi_in_corso: tesi,
          bio
        });

      if (!error) {
        setModifica(false);
        caricaProfilo(utente.id);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      fontFamily: 'Georgia, serif',
      color: 'white',
      maxWidth: '650px',
      margin: '0 auto',
      padding: '2rem'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Profilo</h1>
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

      {/* Se siamo in modalità modifica mostriamo il form */}
      {modifica ? (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          padding: '1.5rem'
        }}>

          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{
              width: '100%', background: '#0f0f0f', border: '1px solid #333',
              color: 'white', padding: '10px', fontFamily: 'Georgia, serif',
              fontSize: '1rem', marginBottom: '1rem'
            }}
          />

          <input
            type="text"
            placeholder="Autori preferiti (es. Heidegger, Kant, Aristotele)"
            value={autori}
            onChange={(e) => setAutori(e.target.value)}
            style={{
              width: '100%', background: '#0f0f0f', border: '1px solid #333',
              color: 'white', padding: '10px', fontFamily: 'Georgia, serif',
              fontSize: '1rem', marginBottom: '1rem'
            }}
          />

          <input
            type="text"
            placeholder="Corrente filosofica (es. Fenomenologia, Etica analitica)"
            value={corrente}
            onChange={(e) => setCorrente(e.target.value)}
            style={{
              width: '100%', background: '#0f0f0f', border: '1px solid #333',
              color: 'white', padding: '10px', fontFamily: 'Georgia, serif',
              fontSize: '1rem', marginBottom: '1rem'
            }}
          />

          <input
            type="text"
            placeholder="Tesi in corso (argomento)"
            value={tesi}
            onChange={(e) => setTesi(e.target.value)}
            style={{
              width: '100%', background: '#0f0f0f', border: '1px solid #333',
              color: 'white', padding: '10px', fontFamily: 'Georgia, serif',
              fontSize: '1rem', marginBottom: '1rem'
            }}
          />

          <textarea
            placeholder="Bio — descrivi il tuo percorso filosofico"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{
              width: '100%', background: '#0f0f0f', border: '1px solid #333',
              color: 'white', padding: '10px', fontFamily: 'Georgia, serif',
              fontSize: '1rem', resize: 'vertical', minHeight: '100px',
              marginBottom: '1rem'
            }}
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={salvaProfilo}
              style={{
                background: 'white', color: 'black', border: 'none',
                padding: '10px 24px', fontFamily: 'Georgia, serif', cursor: 'pointer'
              }}>
              Salva
            </button>
            <button
              onClick={() => setModifica(false)}
              style={{
                background: 'transparent', color: '#888', border: '1px solid #333',
                padding: '10px 24px', fontFamily: 'Georgia, serif', cursor: 'pointer'
              }}>
              Annulla
            </button>
          </div>
        </div>

      ) : (
        // Visualizzazione del profilo
        <div>
          {profilo ? (
            <div>
              {/* Nome */}
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                {profilo.nome || 'Nessun nome'}
              </h2>

              {/* Bio */}
              {profilo.bio && (
                <p style={{ color: '#aaa', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {profilo.bio}
                </p>
              )}

              {/* Dati filosofici */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {profilo.autori_preferiti && (
                  <div style={{ background: '#1a1a1a', border: '1px solid #333', padding: '1rem' }}>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.3rem' }}>AUTORI PREFERITI</p>
                    <p>{profilo.autori_preferiti}</p>
                  </div>
                )}

                {profilo.corrente_filosofica && (
                  <div style={{ background: '#1a1a1a', border: '1px solid #333', padding: '1rem' }}>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.3rem' }}>CORRENTE FILOSOFICA</p>
                    <p>{profilo.corrente_filosofica}</p>
                  </div>
                )}

                {profilo.tesi_in_corso && (
                  <div style={{ background: '#1a1a1a', border: '1px solid #333', padding: '1rem' }}>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.3rem' }}>TESI IN CORSO</p>
                    <p>{profilo.tesi_in_corso}</p>
                  </div>
                )}

              </div>

              {/* Bottone modifica */}
              <button
                onClick={() => setModifica(true)}
                style={{
                  background: 'white', color: 'black', border: 'none',
                  padding: '10px 24px', fontFamily: 'Georgia, serif',
                  cursor: 'pointer', marginTop: '1.5rem'
                }}>
                Modifica profilo
              </button>
            </div>
          ) : (
            // Se non c'è ancora un profilo
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                Non hai ancora creato il tuo profilo filosofico.
              </p>
              <button
                onClick={() => setModifica(true)}
                style={{
                  background: 'white', color: 'black', border: 'none',
                  padding: '10px 24px', fontFamily: 'Georgia, serif', cursor: 'pointer'
                }}>
                Crea profilo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profilo;