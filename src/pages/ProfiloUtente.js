/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../supabase';

function ProfiloUtente() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [utente, setUtente] = useState(null);
  const [profilo, setProfilo] = useState(null);
  const [seguendo, setSeguendo] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    caricaUtente();
    caricaProfilo();
    caricaPostsUtente();
  }, [id]);

  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
    if (user) verificaSeguendo(user.id);
  };

  const caricaProfilo = async () => {
    const { data, error } = await supabase
      .from('profili')
      .select('*')
      .eq('user_id', id)
      .single();
    if (!error) setProfilo(data);

    // Carica followers e following
    const { data: f1 } = await supabase.from('follows').select('*').eq('following_id', id);
    const { data: f2 } = await supabase.from('follows').select('*').eq('follower_id', id);
    if (f1) setFollowers(f1.length);
    if (f2) setFollowing(f2.length);
  };

  const caricaPostsUtente = async () => {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    if (!error) setPosts(data);
  };

  const verificaSeguendo = async (myId) => {
    const { data } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', myId)
      .eq('following_id', id)
      .single();
    setSeguendo(!!data);
  };

  const toggleFollow = async () => {
    if (!utente) return;
    
    if (seguendo) {
      // Smettiamo di seguire — eliminiamo il record
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', utente.id)
        .eq('following_id', id);
      setSeguendo(false);
      setFollowers(prev => prev - 1);
      
    } else {
      // Iniziamo a seguire — inseriamo il record
      await supabase
        .from('follows')
        .insert({ follower_id: utente.id, following_id: id });
      setSeguendo(true);
      setFollowers(prev => prev + 1);
      
      // Prendiamo il nome di chi sta seguendo
      const { data: profiloMio } = await supabase
        .from('profili')
        .select('nome')
        .eq('user_id', utente.id)
        .single();
      
      const mioNome = profiloMio?.nome || 'Qualcuno';
      
      // Mandiamo la notifica all'utente seguito
      await supabase
        .from('notifiche')
        .insert({
          user_id: id,                    // destinatario — l'utente che viene seguito
          tipo: 'follow',                 // tipo notifica
          messaggio: `${mioNome} ha iniziato a seguirti`,
          letta: false,
          link: `/profilo/${utente.id}`   // porta al profilo di chi segue
        });
    }
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
      gap: '12px',
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

  const iniziali = profilo ? (profilo.nome || '??').substring(0, 2).toUpperCase() : '??';

  return (
    <div style={s.page}>

      {/* Topbar */}
      <div style={s.topbar}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '20px' }}>←</button>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.1em' }}>
          {profilo ? profilo.nome : '_ profilo'}
        </span>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={s.avatar}>{iniziali}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 4px', fontFamily: "'Space Mono', monospace" }}>
              {profilo ? profilo.nome : '??'}
            </p>
            {profilo && profilo.corrente_filosofica && (
              <p style={{ fontSize: '12px', color: '#555', margin: 0, fontFamily: "'Space Mono', monospace" }}>
                {profilo.corrente_filosofica}
              </p>
            )}
          </div>
          {/* Bottone segui — non mostrato se sei tu stesso */}
          {utente && utente.id !== id && (
            <button
              onClick={toggleFollow}
              style={{
                background: seguendo ? 'transparent' : '#F5D90A',
                color: seguendo ? '#555' : '#141414',
                border: seguendo ? '1px solid #2a2a2a' : 'none',
                padding: '8px 16px', fontSize: '12px', fontWeight: 700,
                fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px'
              }}>
              {seguendo ? 'Segui già' : 'Segui'}
            </button>
          )}
        </div>

        {/* Stats */}
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

        {/* Bio e info */}
        {profilo && (
          <div style={{ marginBottom: '20px' }}>
            {profilo.bio && <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6, marginBottom: '12px' }}>{profilo.bio}</p>}
            {profilo.autori_preferiti && (
              <div style={{ marginBottom: '10px' }}>
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
          </div>
        )}

        {/* Post dell'utente */}
        <p style={{ fontSize: '10px', color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em', marginBottom: '12px' }}>POST</p>
        {posts.length === 0 ? (
          <p style={{ color: '#555', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>_ nessun post ancora</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ padding: '12px 0', borderBottom: '1px solid #1f1f1f' }}>
              <p style={{ fontSize: '14px', color: '#d0d0d0', lineHeight: 1.6, margin: '0 0 6px' }}>{post.contenuto}</p>
              {post.tag && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {post.tag.split(',').map((t, i) => (
                    <span key={i} style={{ fontSize: '10px', padding: '2px 7px', border: '1px solid #2a2a2a', color: '#666', fontFamily: "'Space Mono', monospace", borderRadius: '2px' }}>
                      {t.trim().toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '11px', color: '#555', margin: '6px 0 0', fontFamily: "'Space Mono', monospace" }}>
                {new Date(post.created_at).toLocaleDateString('it-IT')}
              </p>
            </div>
          ))
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
        <div style={s.navItem} onClick={() => navigate('/profilo')}>
          <span style={{ fontSize: '21px' }}>◯</span>
          <span>Profilo</span>
        </div>
      </div>

    </div>
  );
}

export default ProfiloUtente;