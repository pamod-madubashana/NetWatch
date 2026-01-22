import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const shortcuts: Record<string, string> = {
  '1': '/',
  '2': '/connections',
  '3': '/about',
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + number for navigation
      if ((e.ctrlKey || e.metaKey) && shortcuts[e.key]) {
        e.preventDefault();
        navigate(shortcuts[e.key]);
      }

      // Ctrl/Cmd + R for refresh (prevent default and show custom refresh)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        // Let browser handle this or implement custom refresh
      }

      // Escape to go back
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
