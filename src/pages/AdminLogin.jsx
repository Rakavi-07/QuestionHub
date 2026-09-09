import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import StatusBanner from '@/components/StatusBanner';
import { adminLogin } from '@/api/auth';
import { setSession } from '@/utils/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    setLoading(true);

    try {
      const { data } = await adminLogin(form);
      setSession({ token: data.token, user: data.admin });
      navigate('/admin');
    } catch (err) {
      const message = err?.response?.data?.message || 'Incorrect email or password.';
      setBanner({ variant: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Admin Portal"
      title="Admin sign in"
      subtitle="Manage question papers, students and access approvals."
      illustrationSide="right"
    >
      <StatusBanner variant={banner?.variant} message={banner?.message} />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="Admin Email"
          type="email"
          icon={ShieldCheck}
          placeholder="admin@srmist.edu.in"
          value={form.email}
          onChange={handleChange('email')}
          required
        />
        <InputField
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange('password')}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
            Remember me
          </label>
          <a href="#" className="font-medium text-brand-500 hover:underline">
            Forgot Password?
          </a>
        </div>

        <PrimaryButton type="submit" variant="secondary" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </PrimaryButton>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Not an admin?{' '}
        <Link to="/student/login" className="font-semibold text-brand-500 hover:underline">
          Go to Student Login
        </Link>
      </p>
    </AuthLayout>
  );
}
