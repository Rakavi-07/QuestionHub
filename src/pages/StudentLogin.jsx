import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import StatusBanner from '@/components/StatusBanner';
import { studentLogin } from '@/api/auth';
import { setSession } from '@/utils/auth';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null); // { variant, message }

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    setLoading(true);

    try {
      const { data } = await studentLogin(form);
      setSession({ token: data.token, user: data.student });
      navigate('/dashboard/student');
    } catch (err) {
      const responseData = err?.response?.data;
      const status = responseData?.status;

      if (status === 'pending') {
        setBanner({
          variant: 'warning',
          message: 'Your account is awaiting admin approval.',
        });
      } else if (status === 'rejected') {
        setBanner({
          variant: 'error',
          message:
            'Your registration has been rejected. Please contact the department.',
        });
      } else {
        setBanner({
          variant: 'error',
          message: responseData?.message || 'Incorrect email or password.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Student Portal"
      title="Welcome back"
      subtitle="Sign in with your official SRM email to access your question papers."
    >
      <StatusBanner variant={banner?.variant} message={banner?.message} />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="Official SRM Email"
          type="email"
          icon={Mail}
          placeholder="yourname@srmist.edu.in"
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

        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </PrimaryButton>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&rsquo;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-500 hover:underline">
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
}
