import { AlertCircle, Clock, XCircle } from 'lucide-react';

const styles = {
  error: {
    icon: XCircle,
    classes:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400',
  },
  warning: {
    icon: Clock,
    classes:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  },
  info: {
    icon: AlertCircle,
    classes:
      'border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300',
  },
};

export default function StatusBanner({ variant = 'error', message, className = '' }) {
  if (!message) return null;
  const { icon: Icon, classes } = styles[variant] ?? styles.error;

  return (
    <div
      role="alert"
      className={`mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-relaxed ${classes} ${className}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
