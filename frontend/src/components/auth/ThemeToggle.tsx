import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAuth();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        flex items-center justify-center w-9 h-9 rounded-lg
        border border-[#DDE8E4] dark:border-[#073B3A]
        bg-white dark:bg-[#0F2929]
        text-[#64748B] dark:text-[#A7D9CE]
        hover:bg-[#EAF7F2] dark:hover:bg-[#073B3A]
        hover:text-[#087F6D] dark:hover:text-[#4FD1C5]
        transition-colors focus-visible:outline-2 focus-visible:outline-[#087F6D] focus-visible:outline-offset-2
      "
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
