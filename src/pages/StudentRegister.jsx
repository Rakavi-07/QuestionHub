import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookMarked,
  User,
  Mail,
  Lock,
  Hash,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';
import PrimaryButton from '@/components/PrimaryButton';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { registerStudent } from '@/api/auth';
import { SEMESTER_OPTIONS } from '@/utils/subjects';

const yearOptions = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
  { value: 5, label: '5th Year (Internship)' },
];

const initialForm = {
  fullName: '',
  registerNumber: '',
  email: '',
  year: '',
  semester: '',
  password: '',
  confirmPassword: '',
};

function SuccessScreen({ onBackToLogin }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 text-center shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-accent to-brand-500 text-white shadow-lg shadow-emerald-accent/30"
      >
        <CheckCircle2 size={40} />
      </motion.div>

      <h1 className="font-display text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
        Registration Submitted Successfully
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Your registration request has been submitted successfully.
        <br />
        Your account is currently awaiting admin approval.
        <br />
        You will be able to login only after your account has been approved.
      </p>

      <div className="mt-8">
        <PrimaryButton onClick={onBackToLogin}>Back to Login</PrimaryButton>
      </div>
    </motion.div>
  );
}

export default function StudentRegister() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerStudent({
        fullName: form.fullName,
        registerNumber: form.registerNumber,
        email: form.email,
        year: form.year,
        semester: form.semester,
        password: form.password,
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Something went wrong while submitting your registration. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/60 via-paper to-paper dark:from-brand-500/[0.06] dark:via-paper-dark dark:to-paper-dark">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-500 dark:text-slate-400"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessScreen key="success" onBackToLogin={() => navigate('/student/login')} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-10"
            >
              <div className="mb-8 text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-accent text-white">
                    <BookMarked size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                    Student Registration
                  </span>
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
                  Create your student account
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  Register with your official SRM details to request access to
                  Physiotherapy previous year question papers.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="Full Name"
                    icon={User}
                    placeholder="e.g. Rakavi R"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    required
                  />
                  <InputField
                    label="Register Number"
                    icon={Hash}
                    placeholder="e.g. RA2311003xxxxx"
                    value={form.registerNumber}
                    onChange={handleChange('registerNumber')}
                    required
                  />
                </div>

                <InputField
                  label="Official Email"
                  type="email"
                  icon={Mail}
                  placeholder="yourname@srmist.edu.in"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Current Year"
                    options={yearOptions}
                    value={form.year}
                    onChange={handleChange('year')}
                    required
                  />
                  <SelectField
                    label="Current Semester"
                    options={SEMESTER_OPTIONS}
                    value={form.semester}
                    onChange={handleChange('semester')}
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="Password"
                    type="password"
                    icon={Lock}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange('password')}
                    required
                  />
                  <InputField
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                  />
                </div>

                <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  Only students with an official{' '}
                  <span className="font-semibold">@srmist.edu.in</span> email can
                  register.
                </p>

                <PrimaryButton type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Register'}
                </PrimaryButton>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/student/login"
                  className="font-semibold text-brand-500 hover:underline"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
