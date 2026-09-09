import { useId } from 'react';

export default function InputField({
  label,
  type = 'text',
  placeholder,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  ...props
}) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-emerald-accent ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-ink placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-white/5 dark:text-ink-dark dark:placeholder:text-slate-500 ${
            Icon ? 'pl-11' : ''
          }`}
          {...props}
        />
      </div>
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
