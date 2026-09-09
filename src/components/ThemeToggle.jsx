import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle({ theme, toggleTheme, className = '' }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/70 text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand-400 ${className}`}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? <Moon size={17} /> : <Sun size={17} />}
      </motion.div>
    </button>
  );
}
