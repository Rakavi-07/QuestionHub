import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import PrimaryButton from './PrimaryButton';
import { useTheme } from '@/hooks/useTheme';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Student Login', to: '/student/login' },
  { label: 'Admin Login', to: '/admin/login' },
  { label: 'About', to: '/#about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-paper/80 backdrop-blur-md dark:border-white/10 dark:bg-paper-dark/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-accent text-white shadow-md shadow-brand-500/20 transition-transform duration-300 group-hover:rotate-6">
            <BookMarked size={18} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink dark:text-ink-dark">
            Question<span className="text-brand-500">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-brand-500 ${
                location.pathname === link.to
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <PrimaryButton as={Link} to="/student/login" className="!px-5 !py-2.5 text-sm">
            Student Login
          </PrimaryButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-200/70 bg-paper lg:hidden dark:border-white/10 dark:bg-paper-dark"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
