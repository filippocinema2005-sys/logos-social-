/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Notifiche() {

  const navigate = useNavigate();
  const [notifiche, setNotifiche] = useState([]);
  const [utente, setUtente] = useState(null);

  useEffect(() => {
    caricaUtente();
  }, []);

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
      .order('created_at', { ascending: false });
    if (!error) setNotifiche(data);
  };

  // Segna tutte le notifiche come lette
  const segnaLette = async () => {
    if (!utente) return;
    await supabase
      .from('notifiche')
      .update({ letta: true })
      .eq('user_id', utente.id);
    caricaNotifiche(utente.id);
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
          onClick={segnaLette}
          style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', padding: '4px 12px', fontSize: '11px', fontFamily: "'Space Mono', monospace", cursor: 'pointer', borderRadius: '2px' }}>
          Segna tutte lette
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', letterSpacing: '0.1em', color: '#fff', marginBottom: '16px' }}>
          _ NOTIFICHE
        </h2>

        {notifiche.length === 0 ? (
          <p style={{ color: '#555', fontFamily: "'Space Mono', monospace", fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>
            _ nessuna notifica
          </p>
        ) : (
          notifiche.map((n) => (
            <div
              key={n.id}
              onClick={() => n.link && navigate(n.link)}
              style={{
                padding: '12px 14px',
                marginBottom: '8px',
                borderLeft: n.letta ? '2px solid #2a2a2a' : '2px solid #F5D90A',
                background: n.letta ? '#1a1a1a' : '#1f1a00',
                cursor: n.link ? 'pointer' : 'default'
              }}>
              <p style={{ fontSize: '13px', color: n.letta ? '#888' : '#e8e8e8', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                {n.messaggio}
              </p>
              <p style={{ fontSize: '11px', color: '#555', margin: '4px 0 0', fontFamily: "'Space Mono', monospace" }}>
                {new Date(n.created_at).toLocaleString('it-IT')}
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

export default Notifiche;