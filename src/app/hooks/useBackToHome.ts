import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useBackToHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add a dummy history entry
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Prevent the default back behavior
      event.preventDefault();
      
      // Add another dummy entry
      window.history.pushState(null, '', window.location.href);
      
      // Navigate to home
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);
}; 