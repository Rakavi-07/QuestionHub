import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookMarked } from 'lucide-react';
import PaperStackIllustration from '@/components/PaperStackIllustration';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

export default function AuthLayout({
  children,
  eyebrow = 'QuestionHub',
  title,
  subtitle,
  illustrationSide = 'left',
}) {
  const { theme, toggleTheme } = useTheme();

  const illustration = (
    <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-accent p-10 lg:flex">
      <div className="absolute inset-0 opacity-[0.07] perforation" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <PaperStackIllustration className="mb-6" />
        <h2 className="max-w-sm font-display text-2xl font-semibold tracking-tight text-white">
          A trusted archive of previous year question papers
        </h2>
        <p className="mt-3 max-w-xs text-sm text-white/80">
          Built exclusively for Physiotherapy (BPT) students at SRMIST.
        </p>
      </div>
    </div>
  );

  const form = (
    <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-500 dark:text-slate-400">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-accent text-white">
              <BookMarked size={16} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              {eyebrow}
            </span>
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {children}
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-paper dark:bg-paper-dark">
      {illustrationSide === 'left' ? (
        <>
          {illustration}
          {form}
        </>
      ) : (
        <>
          {form}
          {illustration}
        </>
      )}
    </div>
  );
}
