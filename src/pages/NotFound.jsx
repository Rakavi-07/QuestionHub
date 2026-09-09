import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FileQuestion } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center dark:bg-paper-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8 flex h-40 w-40 items-center justify-center"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500/15 to-emerald-accent/15 blur-2xl" />
        <motion.div
          animate={{ rotate: [0, -6, 0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="perforation relative flex h-32 w-28 items-center justify-center rounded-2xl border border-white/40 bg-gradient-to-br from-brand-500 to-indigo-accent text-white shadow-2xl"
        >
          <FileQuestion size={40} />
        </motion.div>
      </motion.div>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="font-display text-7xl font-bold tracking-tight text-ink dark:text-ink-dark"
      >
        404
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink dark:text-ink-dark"
      >
        Page Not Found
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400"
      >
        The paper you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-8"
      >
        <PrimaryButton as={Link} to="/">
          <Home size={16} /> Go Home
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
