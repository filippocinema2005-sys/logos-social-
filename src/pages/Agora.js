/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Agora() {

  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [postSeguiti, setPostSeguiti] = useState([]);
  const [tabAttiva, setTabAttiva] = useState('perte');
  const [nuovoPost, setNuovoPost] = useState('');
  const [tagPost, setTagPost] = useState('');
  const [utente, setUtente] = useState(null);
  const [mostraForm, setMostraForm] = useState(false);
  const [commentoApertoId, setCommentoApertoId] = useState(null);
  const [nuovoCommento, setNuovoCommento] = useState('');
  const [commenti, setCommenti] = useState({});
  const [mostraNotifiche, setMostraNotifiche] = useState(false);
  const [notifiche, setNotifiche] = useState([]);

  useEffect(() => {
    caricaUtente();
    caricaPosts();
  }, []);

  useEffect(() => {
    if (utente) caricaPostSeguiti();
  }, [utente]);

  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
    if (user) caricaNotifiche(user.id);
  };

  const caricaNotifiche = async (userId) => {
    const { data, error } = await supabase
      .from('notifiche')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error) setNotifiche(data);
  };

  const caricaPosts = async () => {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPosts(data);
  };

  const caricaPostSeguiti = async () => {
    if (!utente) return;
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', utente.id);
    if (!follows || follows.length === 0) {
      setPostSeguiti([]);
      return;
    }
    const ids = follows.map(f => f.following_id);
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .in('user_id', ids)
      .order('created_at', { ascending: false });
    if (!error) setPostSeguiti(data);
  };

  const pubblicaPost = async () => {
    if (!nuovoPost.trim()) return;
    
    // Prendiamo il nome dal profilo se esiste
    const { data: profiloUtente } = await supabase
      .from('profili')
      .select('nome')
      .eq('user_id', utente.id)
      .single();
  
    const nomeDisplay = profiloUtente?.nome 
      ? profiloUtente.nome.toUpperCase() 
      : utente.email.split('@')[0].toUpperCase();
  
    const { error } = await supabase
      .from('post')
      .insert({
        contenuto: nuovoPost,
        user_id: utente.id,
        nome_utente: nomeDisplay,
        likes: 0,
        tag: tagPost.trim() || null
      });
    if (!error) {
      setNuovoPost('');
      setTagPost('');
      setMostraForm(false);
      caricaPosts();
    }
  };

  const mettiLike = async (post) => {
    const { error } = await supabase
      .from('post')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('id', post.id);
    if (!error) caricaPosts();
  };

  const toggleCommenti = async (postId) => {
    if (commentoApertoId === postId) {
      setCommentoApertoId(null);
    } else {
      setCommentoApertoId(postId);
      caricaCommenti(postId);
    }
  };

  const caricaCommenti = async (postId) => {
    const { data, error } = await supabase
      .from('commenti')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error) setCommenti(prev => ({ ...prev, [postId]: data }));
  };

  const pubblicaCommento = async (postId) => {
    if (!nuovoCommento.trim()) return;
    
    const { data: profiloUtente } = await supabase
      .from('profili')
      .select('nome')
      .eq('user_id', utente.id)
      .single();
  
    const nomeDisplay = profiloUtente?.nome 
      ? profiloUtente.nome.toUpperCase() 
      : utente.email.split('@')[0].toUpperCase();
  
    const { error } = await supabase
      .from('commenti')
      .insert({
        contenuto: nuovoCommento,
        user_id: utente.id,
        nome_utente: nomeDisplay,
        post_id: postId
      });
    if (!error) {
      setNuovoCommento('');
      caricaCommenti(postId);
    }
  };

  const eliminaPost = async (postId, postUserId) => {
    if (utente.id !== postUserId) return;
    const { error } = await supabase
      .from('post')
      .delete()
      .eq('id', postId);
    if (!error) caricaPosts();
  };

  const eliminaCommento = async (commentoId, commentoUserId, postId) => {
    if (utente.id !== commentoUserId) return;
    const { error } = await supabase
      .from('commenti')
      .delete()
      .eq('id', commentoId);
    if (!error) caricaCommenti(postId);
  };

  const iniziali = utente ? utente.email.substring(0, 2).toUpperCase() : '??';

  // Calcola il feed in base alla tab attiva
  const feedAttivo = () => {
    if (tabAttiva === 'seguiti') return postSeguiti;
    if (tabAttiva === 'trending') return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return posts;
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
    logo: {
      fontFamily: "'Space Mono', monospace",
      fontSize: '18px',
      fontWeight: 700,
      letterSpacing: '0.15em',
      color: '#fff'
    },
    tabs: { display: 'flex', borderBottom: '1px solid #2a2a2a' },
    tab: {
      flex: 1, textAlign: 'center', padding: '10px',
      fontSize: '12px', fontWeight: 500, color: '#555',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      cursor: 'pointer', fontFamily: "'Space Mono', monospace"
    },
    tabActive: {
      flex: 1, textAlign: 'center', padding: '10px',
      fontSize: '12px', fontWeight: 500, color: '#F5D90A',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      cursor: 'pointer', fontFamily: "'Space Mono', monospace",
      borderBottom: '2px solid #F5D90A'
    },
    avatar: {
      width: '34px', height: '34px', borderRadius: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700,
      fontFamily: "'Space Mono', monospace", flexShrink: 0,
      background: '#1f1a00', color: '#F5D90A'
    },
    fab: {
      width: '38px', height: '38px', borderRadius: '50%',
      background: '#F5D90A', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, border: 'none',
      fontSize: '16px'
    },
    badge: {
      fontSize: '10px', padding: '2px 7px', borderRadius: '2px',
      fontWeight: 700, fontFamily: "'Space Mono', monospace",
      marginLeft: 'auto', background: '#1f1a00',
      color: '#F5D90A', border: '1px solid #F5D90A'
    },
    action: {
      fontSize: '12px', display: 'flex', alignItems: 'center',
      gap: '4px', fontFamily: "'Space Mono', monospace",
      color: '#555', cursor: 'pointer', background: 'none',
      border: 'none'
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

  const renderPost = (post) => (
    <div key={post.id}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1f1f1f', display: 'flex', gap: '10px' }}>
        <div style={s.avatar}>{post.nome_utente ? post.nome_utente.substring(0, 2) : '??'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Space Mono', monospace" }}>
              {post.nome_utente || 'ANONIMO'}
            </span>
            <span style={{ fontSize: '11px', color: '#555', fontFamily: "'Space Mono', monospace" }}>
              / {new Date(post.created_at).toLocaleDateString('it-IT')}
            </span>
            <span style={s.badge}>Λ 0</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#d0d0d0', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>
            {post.contenuto}
          </p>
          {post.tag && (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {post.tag.split(',').map((t, i) => (
                <span key={i} style={{ fontSize: '10px', padding: '2px 7px', border: '1px solid #2a2a2a', color: '#666', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em', borderRadius: '2px' }}>
                  {t.trim().toUpperCase()}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => mettiLike(post)} style={{ ...s.action, color: post.likes > 0 ? '#F5D90A' : '#555' }}>
              ♡ {post.likes || 0}
            </button>
            <button onClick={() => toggleCommenti(post.id)} style={{ ...s.action, color: commentoApertoId === post.id ? '#F5D90A' : '#555' }}>
              ◎ {commenti[post.id] ? commenti[post.id].length : 0}
            </button>
            <button style={s.action}>↺</button>
            <button style={{ ...s.action, marginLeft: 'auto' }}>⊞</button>
            {utente && utente.id === post.user_id && (
              <button onClick={() => eliminaPost(post.id, post.user_id)} style={{ ...s.action, color: '#555' }}>🗑</button>
            )}
          </div>
        </div>
      </div>

      {commentoApertoId === post.id && (
        <div style={{ background: '#1a1a1a', borderBottom: '1px solid #1f1f1f', padding: '12px 16px 12px 60px' }}>
          {commenti[post.id] && commenti[post.id].map((c) => (
            <div key={c.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#F5D90A', fontFamily: "'Space Mono', monospace" }}>{c.nome_utente || 'ANONIMO'}</span>
                <p style={{ fontSize: '13px', color: '#d0d0d0', margin: '4px 0 0', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.5 }}>{c.contenuto}</p>
              </div>
              {utente && utente.id === c.user_id && (
                <button onClick={() => eliminaCommento(c.id, c.user_id, post.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>🗑</button>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              type="text"
              placeholder="Scrivi un commento..."
              value={nuovoCommento}
              onChange={(e) => setNuovoCommento(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') pubblicaCommento(post.id); }}
              style={{ flex: 1, background: '#222', border: '1px solid #2a2a2a', color: '#e8e8e8', padding: '8px 12px', fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif", outline: 'none', borderRadius: '2px' }}
            />
            <button onClick={() => pubblicaCommento(post.id)} style={{ background: '#F5D90A', color: '#141414', border: 'none', padding: '8px 14px', fontSize: '12px', fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>→</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={s.page}>

      <div style={s.topbar}>
        <span style={{ ...s.logo, cursor: 'pointer' }} onClick={() => navigate('/agora')}>
          Λ<span style={{ color: '#F5D90A' }}>Ο</span>ΓΟΣ
        </span>
        <div style={{ display: 'flex', gap: '14px', color: '#555', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => navigate('/cerca')}>🔍</span>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => setMostraNotifiche(!mostraNotifiche)}>🔔</span>
            {notifiche.filter(n => !n.letta).length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', background: '#F5D90A' }} />
            )}
            {mostraNotifiche && (
              <div style={{ position: 'absolute', top: '30px', right: '-16px', width: '300px', background: '#1a1a1a', border: '1px solid #2a2a2a', zIndex: 100 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#fff', letterSpacing: '0.1em' }}>NOTIFICHE</span>
                  <button onClick={() => setMostraNotifiche(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                </div>
                {notifiche.length === 0 ? (
                  <p style={{ color: '#555', fontFamily: "'Space Mono', monospace", fontSize: '12px', textAlign: 'center', padding: '1.5rem' }}>_ nessuna notifica</p>
                ) : (
                  notifiche.map((n) => (
                    <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid #222', borderLeft: n.letta ? '2px solid transparent' : '2px solid #F5D90A', background: n.letta ? 'transparent' : '#1f1a00' }}>
                      <p style={{ fontSize: '13px', color: n.letta ? '#888' : '#e8e8e8', margin: 0 }}>{n.messaggio}</p>
                      <p style={{ fontSize: '10px', color: '#555', margin: '3px 0 0', fontFamily: "'Space Mono', monospace" }}>{new Date(n.created_at).toLocaleString('it-IT')}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div style={{ ...s.avatar, cursor: 'pointer' }} onClick={() => navigate('/profilo')}>{iniziali}</div>
        </div>
      </div>

      <div style={s.tabs}>
        <div style={tabAttiva === 'perte' ? s.tabActive : s.tab} onClick={() => setTabAttiva('perte')}>Per te</div>
        <div style={tabAttiva === 'seguiti' ? s.tabActive : s.tab} onClick={() => { setTabAttiva('seguiti'); caricaPostSeguiti(); }}>Seguiti</div>
        <div style={tabAttiva === 'trending' ? s.tabActive : s.tab} onClick={() => setTabAttiva('trending')}>Trending</div>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={s.avatar}>{iniziali}</div>
        <span onClick={() => setMostraForm(!mostraForm)} style={{ fontSize: '13px', color: '#555', fontFamily: "'Space Mono', monospace", flex: 1, cursor: 'pointer' }}>
          _ condividi le tue idee
        </span>
        <button style={s.fab} onClick={() => setMostraForm(!mostraForm)}>✏️</button>
      </div>

      {mostraForm && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
          <textarea
            placeholder="Cosa stai pensando?"
            value={nuovoPost}
            onChange={(e) => setNuovoPost(e.target.value)}
            autoFocus
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #2a2a2a', color: '#e8e8e8', fontSize: '14px', fontFamily: "'Space Grotesk', sans-serif", resize: 'none', outline: 'none', minHeight: '80px', paddingBottom: '10px', marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="_ tag (es. Heidegger, Etica, Kant)"
            value={tagPost}
            onChange={(e) => setTagPost(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #2a2a2a', color: '#F5D90A', fontSize: '12px', fontFamily: "'Space Mono', monospace", outline: 'none', paddingBottom: '8px', marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setMostraForm(false)} style={{ background: 'transparent', color: '#555', border: '1px solid #2a2a2a', padding: '6px 16px', fontSize: '12px', fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>Annulla</button>
            <button onClick={pubblicaPost} style={{ background: '#F5D90A', color: '#141414', border: 'none', padding: '6px 16px', fontSize: '12px', fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>Pubblica</button>
          </div>
        </div>
      )}

      {feedAttivo().length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '3rem', fontFamily: "'Space Mono', monospace", fontSize: '13px' }}>
          {tabAttiva === 'seguiti' ? '_ non segui ancora nessuno' : '_ nessun post ancora'}
        </p>
      ) : (
        feedAttivo().map(renderPost)
      )}

      <div style={s.bottomnav}>
        <div style={{ ...s.navItem, color: '#F5D90A' }} onClick={() => navigate('/agora')}>
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

export default Agora;