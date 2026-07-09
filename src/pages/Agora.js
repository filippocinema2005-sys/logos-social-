/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Agora() {

  const navigate = useNavigate();

  // Lista di tutti i post nel feed
  const [posts, setPosts] = useState([]);

  // Lista dei post degli utenti che segui
  const [postSeguiti, setPostSeguiti] = useState([]);

  // Quale tab è attiva: 'perte', 'seguiti', 'trending'
  const [tabAttiva, setTabAttiva] = useState('perte');

  // Testo del nuovo post
  const [nuovoPost, setNuovoPost] = useState('');

  // Tag del nuovo post
  const [tagPost, setTagPost] = useState('');

  // Utente loggato
  const [utente, setUtente] = useState(null);

  // Mostra/nasconde il form di pubblicazione
  const [mostraForm, setMostraForm] = useState(false);

  // ID del post con commenti aperti
  const [commentoApertoId, setCommentoApertoId] = useState(null);

  // Testo del nuovo commento
  const [nuovoCommento, setNuovoCommento] = useState('');

  // Commenti per ogni post { postId: [commenti] }
  const [commenti, setCommenti] = useState({});

  // Mostra/nasconde la tendina notifiche
  const [mostraNotifiche, setMostraNotifiche] = useState(false);

  // Lista notifiche
  const [notifiche, setNotifiche] = useState([]);

  // Set degli ID dei post già likati
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Set degli ID dei post salvati
  const [savedPosts, setSavedPosts] = useState(new Set());

  // Al caricamento prendiamo utente e post
  useEffect(() => {
    caricaUtente();
    caricaPosts();
  }, []);

  // Quando l'utente è caricato prendiamo i post dei seguiti
  useEffect(() => {
    if (utente) caricaPostSeguiti();
  }, [utente]);

  // Prende l'utente loggato
  const caricaUtente = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUtente(user);
    if (user) {
      caricaNotifiche(user.id);
      caricaLikes(user.id);
      caricaSalvati(user.id);
    }
  };

  // Prende le notifiche dell'utente
  const caricaNotifiche = async (userId) => {
    const { data, error } = await supabase
      .from('notifiche')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error) setNotifiche(data);
  };

  // Prende tutti i post dal più recente
  const caricaPosts = async () => {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPosts(data);
  };

  // Prende i post degli utenti seguiti
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

  // Prende i post già likati dall'utente
  const caricaLikes = async (userId) => {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId);
    if (!error) {
      const likedSet = new Set(data.map(l => l.post_id));
      setLikedPosts(likedSet);
    }
  };

  // Prende i post già salvati dall'utente
  const caricaSalvati = async (userId) => {
    const { data, error } = await supabase
      .from('salvati')
      .select('post_id')
      .eq('user_id', userId);
    if (!error) {
      const savedSet = new Set(data.map(s => s.post_id));
      setSavedPosts(savedSet);
    }
  };

  // Pubblica un nuovo post
  const pubblicaPost = async () => {
    if (!nuovoPost.trim()) return;
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

  // Like/unlike su un post
  const mettiLike = async (post) => {
    if (!utente) return;
    const haGiaLikato = likedPosts.has(post.id);
    if (haGiaLikato) {
      // Togliamo il like
      await supabase.from('likes').delete().eq('user_id', utente.id).eq('post_id', post.id);
      await supabase.from('post').update({ likes: Math.max(0, (post.likes || 0) - 1) }).eq('id', post.id);
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    } else {
      // Aggiungiamo il like
      await supabase.from('likes').insert({ user_id: utente.id, post_id: post.id });
      await supabase.from('post').update({ likes: (post.likes || 0) + 1 }).eq('id', post.id);
      setLikedPosts(prev => new Set([...prev, post.id]));
      // Notifica al proprietario del post
      if (post.user_id !== utente.id) {
        const { data: profiloMio } = await supabase.from('profili').select('nome').eq('user_id', utente.id).single();
        const mioNome = profiloMio?.nome || utente.email.split('@')[0];
        await supabase.from('notifiche').insert({
          user_id: post.user_id,
          tipo: 'like',
          messaggio: `${mioNome} ha messo like al tuo post`,
          letta: false,
          link: '/agora'
        });
      }
    }
    caricaPosts();
  };

  // Salva/rimuove un post dai salvati
  const toggleSalva = async (post) => {
    if (!utente) return;
    const giaSalvato = savedPosts.has(post.id);
    if (giaSalvato) {
      // Rimuoviamo dai salvati
      await supabase.from('salvati').delete().eq('user_id', utente.id).eq('post_id', post.id);
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    } else {
      // Aggiungiamo ai salvati
      await supabase.from('salvati').insert({ user_id: utente.id, post_id: post.id });
      setSavedPosts(prev => new Set([...prev, post.id]));
    }
  };

  // Apre/chiude i commenti di un post
  const toggleCommenti = async (postId) => {
    if (commentoApertoId === postId) {
      setCommentoApertoId(null);
    } else {
      setCommentoApertoId(postId);
      caricaCommenti(postId);
    }
  };

  // Prende i commenti di un post
  const caricaCommenti = async (postId) => {
    const { data, error } = await supabase
      .from('commenti')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error) setCommenti(prev => ({ ...prev, [postId]: data }));
  };

  // Pubblica un commento e manda notifica
  const pubblicaCommento = async (postId) => {
    if (!nuovoCommento.trim()) return;
    const { data: profiloUtente } = await supabase.from('profili').select('nome').eq('user_id', utente.id).single();
    const nomeDisplay = profiloUtente?.nome ? profiloUtente.nome.toUpperCase() : utente.email.split('@')[0].toUpperCase();
    const { error } = await supabase.from('commenti').insert({
      contenuto: nuovoCommento,
      user_id: utente.id,
      nome_utente: nomeDisplay,
      post_id: postId
    });
    if (!error) {
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== utente.id) {
        await supabase.from('notifiche').insert({
          user_id: post.user_id,
          tipo: 'commento',
          messaggio: `${nomeDisplay} ha commentato il tuo post: "${nuovoCommento.substring(0, 30)}${nuovoCommento.length > 30 ? '...' : ''}"`,
          letta: false,
          link: '/agora'
        });
      }
      setNuovoCommento('');
      caricaCommenti(postId);
    }
  };

  // Elimina un post — solo l'autore
  const eliminaPost = async (postId, postUserId) => {
    if (utente.id !== postUserId) return;
    const { error } = await supabase.from('post').delete().eq('id', postId);
    if (!error) caricaPosts();
  };

  // Elimina un commento — solo l'autore
  const eliminaCommento = async (commentoId, commentoUserId, postId) => {
    if (utente.id !== commentoUserId) return;
    const { error } = await supabase.from('commenti').delete().eq('id', commentoId);
    if (!error) caricaCommenti(postId);
  };

  // Segna tutte le notifiche come lette
  const segnaNotificheLette = async () => {
    if (!utente) return;
    await supabase
      .from('notifiche')
      .update({ letta: true })
      .eq('user_id', utente.id)
      .eq('letta', false);
    setNotifiche(prev => prev.map(n => ({ ...n, letta: true })));
  };

  // Genera colore avatar unico dal nome
  const getColoreAvatar = (nome) => {
    if (!nome) return { bg: '#1f1a00', text: '#F5D90A' };
    const hash = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colori = [
      { bg: '#1f1a00', text: '#F5D90A' },
      { bg: '#0f1a0f', text: '#7BC67E' },
      { bg: '#1a0f0f', text: '#E07070' },
      { bg: '#0f0f1a', text: '#7070E0' },
      { bg: '#1a0f1a', text: '#C070C0' },
      { bg: '#1a1500', text: '#E8B84B' },
      { bg: '#001a1a', text: '#70C0C0' },
      { bg: '#1a001a', text: '#D070A0' },
    ];
    return colori[hash % colori.length];
  };

  // Iniziali dell'utente loggato
  const iniziali = utente ? utente.email.substring(0, 2).toUpperCase() : '??';

  // Feed in base alla tab attiva
  const feedAttivo = () => {
    if (tabAttiva === 'seguiti') return postSeguiti;
    if (tabAttiva === 'trending') return [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return posts;
  };

  // Stili
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

  // Renderizza un singolo post
  const renderPost = (post) => (
    <div key={post.id}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1f1f1f', display: 'flex', gap: '10px' }}>

        {/* Avatar colorato */}
        <div style={{
          ...s.avatar,
          background: getColoreAvatar(post.nome_utente).bg,
          color: getColoreAvatar(post.nome_utente).text
        }}>
          {post.nome_utente ? post.nome_utente.substring(0, 2) : '??'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>

            {/* Nome cliccabile — porta al profilo */}
            <span
              onClick={() => navigate(`/profilo/${post.user_id}`)}
              style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'Space Mono', monospace", cursor: 'pointer' }}>
              {post.nome_utente || 'ANONIMO'}
            </span>

            <span style={{ fontSize: '11px', color: '#555', fontFamily: "'Space Mono', monospace" }}>
              / {new Date(post.created_at).toLocaleDateString('it-IT')}
            </span>
            <span style={s.badge}>Λ 0</span>
          </div>

          {/* Testo del post */}
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#d0d0d0', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>
            {post.contenuto}
          </p>

          {/* Tag */}
          {post.tag && (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {post.tag.split(',').map((t, i) => (
                <span key={i} style={{ fontSize: '10px', padding: '2px 7px', border: '1px solid #2a2a2a', color: '#666', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em', borderRadius: '2px' }}>
                  {t.trim().toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* Azioni */}
          <div style={{ display: 'flex', gap: '16px' }}>

            {/* Like toggle */}
            <button
              onClick={() => mettiLike(post)}
              style={{ ...s.action, color: likedPosts.has(post.id) ? '#F5D90A' : '#555' }}>
              {likedPosts.has(post.id) ? '♥' : '♡'} {post.likes || 0}
            </button>

            {/* Commenti */}
            <button
              onClick={() => toggleCommenti(post.id)}
              style={{ ...s.action, color: commentoApertoId === post.id ? '#F5D90A' : '#555' }}>
              ◎ {commenti[post.id] ? commenti[post.id].length : 0}
            </button>

            {/* Condividi — placeholder */}
            <button style={s.action}>↺</button>

            {/* Salva toggle — giallo se salvato */}
            <button
              onClick={() => toggleSalva(post)}
              style={{ ...s.action, marginLeft: 'auto', color: savedPosts.has(post.id) ? '#F5D90A' : '#555' }}>
              {savedPosts.has(post.id) ? '⊟' : '⊞'}
            </button>

            {/* Elimina — solo l'autore */}
            {utente && utente.id === post.user_id && (
              <button onClick={() => eliminaPost(post.id, post.user_id)} style={{ ...s.action, color: '#555' }}>🗑</button>
            )}
          </div>
        </div>
      </div>

      {/* Sezione commenti */}
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
            <button
              onClick={() => pubblicaCommento(post.id)}
              style={{ background: '#F5D90A', color: '#141414', border: 'none', padding: '8px 14px', fontSize: '12px', fontWeight: 700, fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={s.page}>

      {/* Topbar */}
      <div style={s.topbar}>
        <span style={{ ...s.logo, cursor: 'pointer' }} onClick={() => navigate('/agora')}>
          Λ<span style={{ color: '#F5D90A' }}>Ο</span>ΓΟΣ
        </span>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>

          {/* Ricerca */}
          <span style={{ fontSize: '18px', cursor: 'pointer', color: '#555' }} onClick={() => navigate('/cerca')}>🔍</span>

          {/* Campanella notifiche */}
          <div style={{ position: 'relative' }}>
            <span
              style={{ fontSize: '18px', cursor: 'pointer', color: '#555' }}
              onClick={async () => {
                setMostraNotifiche(!mostraNotifiche);
                if (!mostraNotifiche) await segnaNotificheLette();
              }}>
              🔔
            </span>

            {/* Pallino giallo se ci sono notifiche non lette */}
            {notifiche.filter(n => !n.letta).length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', background: '#F5D90A' }} />
            )}

            {/* Tendina notifiche */}
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
                    <div
                      key={n.id}
                      onClick={() => { if (n.link) navigate(n.link); setMostraNotifiche(false); }}
                      style={{ padding: '10px 14px', borderBottom: '1px solid #222', borderLeft: n.letta ? '2px solid transparent' : '2px solid #F5D90A', background: n.letta ? 'transparent' : '#1f1a00', cursor: n.link ? 'pointer' : 'default' }}>
                      <p style={{ fontSize: '13px', color: n.letta ? '#888' : '#e8e8e8', margin: 0 }}>{n.messaggio}</p>
                      <p style={{ fontSize: '10px', color: '#555', margin: '3px 0 0', fontFamily: "'Space Mono', monospace" }}>{new Date(n.created_at).toLocaleString('it-IT')}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Avatar utente */}
          <div
            style={{ ...s.avatar, cursor: 'pointer', background: getColoreAvatar(utente ? utente.email.split('@')[0] : '').bg, color: getColoreAvatar(utente ? utente.email.split('@')[0] : '').text }}
            onClick={() => navigate('/profilo')}>
            {iniziali}
          </div>
        </div>
      </div>

      {/* Tab */}
      <div style={s.tabs}>
        <div style={tabAttiva === 'perte' ? s.tabActive : s.tab} onClick={() => setTabAttiva('perte')}>Per te</div>
        <div style={tabAttiva === 'seguiti' ? s.tabActive : s.tab} onClick={() => { setTabAttiva('seguiti'); caricaPostSeguiti(); }}>Seguiti</div>
        <div style={tabAttiva === 'trending' ? s.tabActive : s.tab} onClick={() => setTabAttiva('trending')}>Trending</div>
      </div>

      {/* Compose bar */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ ...s.avatar, background: getColoreAvatar(utente ? utente.email.split('@')[0] : '').bg, color: getColoreAvatar(utente ? utente.email.split('@')[0] : '').text }}>
          {iniziali}
        </div>
        <span onClick={() => setMostraForm(!mostraForm)} style={{ fontSize: '13px', color: '#555', fontFamily: "'Space Mono', monospace", flex: 1, cursor: 'pointer' }}>
          _ condividi le tue idee
        </span>
        <button style={s.fab} onClick={() => setMostraForm(!mostraForm)}>✏️</button>
      </div>

      {/* Form nuovo post */}
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

      {/* Feed */}
      {feedAttivo().length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#555', fontFamily: "'Space Mono', monospace", fontSize: '13px', marginBottom: '12px' }}>
            {tabAttiva === 'seguiti' ? '_ non segui ancora nessuno' : '_ nessun post ancora'}
          </p>
          {tabAttiva === 'seguiti' && (
            <span
              onClick={() => navigate('/cerca')}
              style={{ fontSize: '12px', color: '#F5D90A', fontFamily: "'Space Mono', monospace", cursor: 'pointer', textDecoration: 'underline' }}>
              _ cerca filosofi da seguire →
            </span>
          )}
        </div>
      ) : (
        feedAttivo().map(renderPost)
      )}

      {/* Bottom nav */}
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