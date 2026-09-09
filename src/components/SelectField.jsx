import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SelectField({
  label,
  options = [],
  placeholder = 'Select an option',
  required = false,
  className = '',
  value,
  defaultValue,
  ...props
}) {
  const id = useId();
  const isControlled = value !== undefined;

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
        <select
          id={id}
          required={required}
          {...(isControlled ? { value } : { defaultValue: defaultValue ?? '' })}
          style={{ colorScheme: 'light dark' }}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-all duration-200 hover:border-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark dark:hover:border-brand-400"
          {...props}
        >
          <option value="" disabled className="bg-white text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt.value ?? opt}
              value={opt.value ?? opt}
              className="bg-white text-ink dark:bg-slate-900 dark:text-ink-dark"
            >
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}
