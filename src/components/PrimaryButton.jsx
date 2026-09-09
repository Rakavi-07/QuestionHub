import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600',
  secondary:
    'bg-indigo-accent text-white shadow-lg shadow-indigo-accent/25 hover:opacity-90',
  outline:
    'border border-slate-300 text-ink hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-ink-dark dark:hover:border-brand-400',
  ghost:
    'text-ink hover:bg-slate-100 dark:text-ink-dark dark:hover:bg-white/5',
};

export default function PrimaryButton({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  as: Component = 'button',
  disabled = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`inline-block ${disabled ? 'opacity-60' : ''}`}
    >
      <Component
        type={Component === 'button' ? type : undefined}
        disabled={disabled}
        aria-disabled={disabled}
        className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold font-display tracking-tight transition-colors duration-200 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
}
