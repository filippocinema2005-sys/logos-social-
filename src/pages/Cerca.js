/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

function Cerca() {

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [cercando, setCercando] = useState(false);

  const cercaProfili = async (testo) => {
    setQuery(testo);
    if (!testo.trim()) {
      setRisultati([]);
      return;
    }
    setCercando(true);
    const { data, error } = await supabase
      .from('profili')
      .select('*')
      .ilike('nome', `%${testo}%`);
    if (!error) setRisultati(data);
    setCercando(false);
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: '#141414',
      color: '#e8e8e8',
      fontFamily: "'Space Grotesk', sans-serif"
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
      width: '44px', height: '44px', borderRadius: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: 700,
      fontFamily: "'Space Mono', monospace", flexShrink: 0,
      background: '#1f1a00', color: '#F5D90A'
    }
  };

  return (
    <div style={s.page}>

      <div style={s.topbar}>
        <button
          onClick={() => navigate('/agora')}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '20px', flexShrink: 0 }}>
          ←
        </button>
        <input
          type="text"
          placeholder="_ cerca filosofi..."
          value={query}
          onChange={(e) => cercaProfili(e.target.value)}
          autoFocus
          style={{
            flex: 1, background: '#1f1f1f', border: '1px solid #2a2a2a',
            color: '#e8e8e8', padding: '8px 14px', fontSize: '14px',
            fontFamily: "'Space Grotesk', sans-serif", outline: 'none', borderRadius: '2px'
          }}
        />
      </div>

      <div style={{ padding: '8px 0' }}>
        {cercando && (
          <p style={{ color: '#555', textAlign: 'center', padding: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>_ cercando...</p>
        )}

        {!cercando && query && risultati.length === 0 && (
          <p style={{ color: '#555', textAlign: 'center', padding: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>_ nessun profilo trovato</p>
        )}

        {!cercando && !query && (
          <p style={{ color: '#555', textAlign: 'center', padding: '2rem', fontFamily: "'Space Mono', monospace", fontSize: '12px' }}>_ cerca per nome</p>
        )}

        {risultati.map((profilo) => (
          <div
            key={profilo.id}
            onClick={() => navigate(`/profilo/${profilo.user_id}`)}
            style={{
              padding: '12px 16px', borderBottom: '1px solid #1f1f1f',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
            }}>
            <div style={s.avatar}>
              {profilo.nome ? profilo.nome.substring(0, 2).toUpperCase() : '??'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0, fontFamily: "'Space Mono', monospace" }}>
                {profilo.nome}
              </p>
              {profilo.corrente_filosofica && (
                <p style={{ fontSize: '12px', color: '#555', margin: '2px 0 0', fontFamily: "'Space Mono', monospace" }}>
                  {profilo.corrente_filosofica}
                </p>
              )}
            </div>
            <span style={{
              fontSize: '10px', padding: '2px 7px', borderRadius: '2px',
              fontWeight: 700, fontFamily: "'Space Mono', monospace",
              background: '#1f1a00', color: '#F5D90A', border: '1px solid #F5D90A'
            }}>
              Λ 0
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Cerca;