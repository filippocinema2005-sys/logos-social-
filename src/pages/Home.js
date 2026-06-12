/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabase';

// Home ora reindirizza direttamente all'Agorà
// Le quattro sezioni sono accessibili dal bottom nav
function Home() {

  const navigate = useNavigate();

  useEffect(() => {
    // Controlliamo se l'utente è loggato
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Se loggato, andiamo direttamente all'Agorà
        navigate('/agora');
      } else {
        // Se non loggato, torniamo al benvenuto
        navigate('/');
      }
    };
    checkUser();
  }, []);

  return null;
}

export default Home;