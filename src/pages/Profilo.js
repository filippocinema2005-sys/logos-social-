/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Profilo() {

  const navigate = useNavigate();
  const [utente, setUtente] = useState(null);
  const [profilo, setProfilo] = useState(null);
  const [modifica, setModifica] = useState(false);
  const [nome, setNome] = useState('');
  const [autori, setAutori] = useState('');
  const [corrente, setCorrente] = useState('');
  const [tesi, setTesi] = useState('');
  const [bio, setBio] = useState('');
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    caricaUtente();
  }, []);

  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
    if (user) {
      caricaProfilo(user.id);
      caricaFollows(user.id);
    }
  };

  const caricaProfilo = async (userId) => {
    const { data, error } = await supabase
      .from('profili')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (!error && data) {
      setProfilo(data);
      setNome(data.nome || '');
      setAutori(data.autori_preferiti || '');
      setCorrente(data.corrente_filosofica || '');
      setTesi(data.tesi_in_corso || '');
      setBio(data.bio || '');
    }
  };

  const caricaFollows = async (userId) => {
    const { data: f1 } = await supabase
      .from('follows')
      .select('*')
      .eq('following_id', userId);
    const { data: f2 } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', userId);
    if (f1) setFollowers(f1.length);
    if (f2) setFollowing(f2.length);
  };

  const salvaProfilo = async () => {
    if (profilo) {
      const { error } = await supabase
        .from('profili')
        .update({ nome, autori_preferiti: autori, corrente_filosofica: corrente, tesi_in_corso: tesi, bio })
        .eq('user_id', utente.id);
      if (!error) { setModifica(false); caricaProfilo(utente.id); }
    } else {
      const { error } = await supabase
        .from('profili')
        .insert({ user_id: utente.id, nome, autori_preferiti: autori, corrente_filosofica: corrente, tesi_in_corso: tesi, bio });
      if (!error) { setModifica(false); caricaProfilo(utente.id); }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: '#141414',
      color: '#e8e8e8',
      fontFamily: "'Space Grotesk', sans-serif",
      paddingBottom: '80px'
    },
    topbar: {
      padding: '12px 16px',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: '#141414',
      zIndex: 10
    },
    avatar: {
      width: '60px', height: '60px', borderRadius: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '18px', fontWeight: 700,
      fontFamily: "'Space Mono', monospace",
      background: '#1f1a00', color: '#F5D90A'
    },
    input: {
      width: '100%', background: '#1a1a1a',
      border: '1px solid #2a2a2a', color: '#e8e8e8',
      padding: '10px 12px', fontSize: '14px',
      fontFamily: "'Space Grotesk', sans-serif",
      outline: 'none', borderRadius: '2px', marginBottom: '10px'
    },
    bottomnav: {
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 14px', borderTop: '1px solid #2a2a2a',
      background: '#141414', position: 'fixed',
      bottom: 0, left: 0, right: 0, zIndex: 10
    },
    navItem: {
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '3px', fontSize: '9px',
      color: '#555', cursor: 'pointer',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      fontFamily: "'Space Mono', monospace"
    }
  };

  const iniziali = utente ? utente.email.substring(0, 2).toUpperCase() : '??';

  return (
    <div style={s.page}>

      {/* Topbar */}
      <div style={s.topbar}>
        <span
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, letterSpacing: '0.15em', color: '#fff', cursor: 'pointer' }}
          onClick={() => navigate('/agora')}>
          Λ<span style={{ color: '#F5D90A' }}>Ο</span>ΓΟΣ
        </span>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', padding: '4px 12px', fontSize: '11px', fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>
          Esci
        </button>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Header profilo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={s.avatar}>{iniziali}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 4px', fontFamily: "'Space Mono', monospace" }}>
              {profilo ? profilo.nome : utente ? utente.email.split('@')[0].toUpperCase() : ''}
            </p>
            {profilo && profilo.corrente_filosofica && (
              <p style={{ fontSize: '12px', color: '#555', margin: 0, fontFamily: "'Space Mono', monospace" }}>
                {profilo.corrente_filosofica}
              </p>
            )}
          </div>
        </div>

        {/* Stats followers/following */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Space Mono', monospace" }}>{followers}</p>
            <p style={{ fontSize: '10px', color: '#555', margin: '2px 0 0', fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>FOLLOWER</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Space Mono', monospace" }}>{following}</p>
            <p style={{ fontSize: '10px', color: '#555', margin: '2px 0 0', fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>SEGUITI</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#F5D90A', margin: 0, fontFamily: "'Space Mono', monospace" }}>0</p>
            <p style={{ fontSize: '10px', color: '#555', margin: '2px 0 0', fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>LOGOS SCORE</p>
          </div>
        </div>

        {/* Modifica profilo */}
        {modifica ? (
          <div>
            <input style={s.input} type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input style={s.input} type="text" placeholder="Autori preferiti (es. Heidegger, Kant)" value={autori} onChange={(e) => setAutori(e.target.value)} />
            <input style={s.input} type="text" placeholder="Corrente filosofica" value={corrente} onChange={(e) => setCorrente(e.target.value)} />
            <input style={s.input} type="text" placeholder="Tesi in corso" value={tesi} onChange={(e) => setTesi(e.target.value)} />
            <textarea
              style={{ ...s.input, resize: 'vertical', minHeight: '80px' }}
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={salvaProfilo} style={{ background: '#F5D90A', color: '#141414', border: 'none', padding: '10px 24px', fontSize: '12px', fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>
                Salva
              </button>
              <button onClick={() => setModifica(false)} style={{ background: 'transparent', color: '#555', border: '1px solid #2a2a2a', padding: '10px 24px', fontSize: '12px', fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <div>
            {profilo ? (
              <div>
                {profilo.bio && <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6, marginBottom: '16px' }}>{profilo.bio}</p>}
                {profilo.autori_preferiti && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>AUTORI PREFERITI</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {profilo.autori_preferiti.split(',').map((a, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid #F5D90A', color: '#F5D90A', fontFamily: "'Space Mono', monospace", borderRadius: '2px' }}>
                          {a.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profilo.corrente_filosofica && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>CORRENTE</p>
                    <span style={{ fontSize: '11px', padding: '3px 8px', border: '1px solid #2a2a2a', color: '#aaa', fontFamily: "'Space Mono', monospace", borderRadius: '2px' }}>
                      {profilo.corrente_filosofica}
                    </span>
                  </div>
                )}
                {profilo.tesi_in_corso && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em', marginBottom: '6px' }}>TESI IN CORSO</p>
                    <p style={{ fontSize: '13px', color: '#d0d0d0', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.5 }}>{profilo.tesi_in_corso}</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#555', fontFamily: "'Space Mono', monospace", fontSize: '13px', marginBottom: '16px' }}>
                _ nessun profilo ancora
              </p>
            )}
            <button onClick={() => setModifica(true)} style={{ background: '#F5D90A', color: '#141414', border: 'none', padding: '10px 24px', fontSize: '12px', fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>
              {profilo ? 'Modifica profilo' : 'Crea profilo'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomnav}>
        <div style={s.navItem} onClick={() => navigate('/agora')}>
          <span style={{ fontSize: '21px' }}>⌂</span>
          <span>Home</span>
        </div>
        <div style={s.navItem} onClick={() => navigate('/gruppi')}>
          <span style={{ fontSize: '21px' }}>⊕</span>
          <span>Gruppi</span>
        </div>
        <div style={s.navItem} onClick={() => navigate('/symposium')}>
          <span style={{ fontSize: '21px' }}>📄</span>
          <span>Symposium</span>
        </div>
        <div style={{ ...s.navItem, color: '#F5D90A' }}>
          <span style={{ fontSize: '21px' }}>◯</span>
          <span>Profilo</span>
        </div>
      </div>

    </div>
  );
}

export default Profilo;