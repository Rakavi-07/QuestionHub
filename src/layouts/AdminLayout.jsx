import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  BookMarked,
  ShieldCheck,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { getUser, logout } from '@/utils/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Question Papers', href: '/admin/question-papers', icon: FileText },
];

function NavLink({ item, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-ink-dark'
      }`}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

function SidebarContent({ onNavClick }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logout({ redirect: false });
    navigate('/admin/login');
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-accent text-white shadow-lg shadow-brand-500/25">
            <BookMarked size={18} />
          </span>
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-ink dark:text-ink-dark">
              Question<span className="text-brand-500">Hub</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-accent">
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} onClick={onNavClick} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200/70 px-4 py-4 dark:border-white/10">
        {/* Admin info */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-accent to-brand-600 text-white">
            <ShieldCheck size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink dark:text-ink-dark">
              {user?.name || 'Administrator'}
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              {user?.email || 'admin@srmist.edu.in'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            id="admin-logout-btn"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const overlayRef = useRef(null);

  function closeDrawer() {
    setDrawerOpen(false);
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeDrawer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen bg-paper dark:bg-paper-dark">
      {/* ── Desktop fixed sidebar ── */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200/70 bg-white dark:border-white/10 dark:bg-paper-dark lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile: overlay + slide-in drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              ref={overlayRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl dark:bg-slate-900 lg:hidden"
            >
              {/* Close button */}
              <button
                onClick={closeDrawer}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
              <SidebarContent onNavClick={closeDrawer} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-3 dark:border-white/10 dark:bg-paper-dark lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            aria-label="Open menu"
            id="admin-hamburger-btn"
          >
            <Menu size={22} />
          </button>
          <span className="font-display text-sm font-bold tracking-tight text-ink dark:text-ink-dark">
            Question<span className="text-brand-500">Hub</span>{' '}
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-accent">
              Admin
            </span>
          </span>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
