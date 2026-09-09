import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import { fetchAdminStats, fetchStudents, updateStudentStatus } from '@/api/admin';
import { getUser } from '@/utils/auth';

/* ─── Stat card ─────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, gradient, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-white/10"
    >
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-10 ${gradient}`} />
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white ${gradient} shadow-lg`}>
        <Icon size={22} />
      </div>
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      ) : (
        <p className="font-display text-3xl font-bold text-ink dark:text-ink-dark">{value ?? 0}</p>
      )}
      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

/* ─── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const styles = {
    Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || ''}`}>
      {status}
    </span>
  );
}

/* ─── Confirmation modal ─────────────────────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <p className="mb-6 text-sm font-medium text-ink dark:text-ink-dark">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
export default function AdminDashboard() {
  const user = getUser();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);

  const [confirm, setConfirm] = useState(null); // { studentId, status, name }
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const { data } = await fetchAdminStats();
      setStats(data);
    } catch {
      setStatsError('Unable to load statistics. Please try again.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadPending = useCallback(async () => {
    setPendingLoading(true);
    setPendingError(null);
    try {
      const { data } = await fetchStudents({ status: 'Pending', page: 1, limit: 10 });
      setPending(data.students || []);
    } catch {
      setPendingError('Unable to load pending registrations.');
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadPending();
  }, [loadStats, loadPending]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleConfirmAction() {
    if (!confirm) return;
    setActionLoading(true);
    try {
      await updateStudentStatus(confirm.studentId, confirm.status);
      showToast(`Student ${confirm.status === 'Approved' ? 'approved' : 'rejected'} successfully.`);
      setConfirm(null);
      await Promise.all([loadStats(), loadPending()]);
    } catch {
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  const STAT_CARDS = [
    { label: 'Total Students',    key: 'totalStudents',    icon: Users,        gradient: 'bg-gradient-to-br from-brand-500 to-brand-700' },
    { label: 'Pending Approvals', key: 'pendingStudents',  icon: Clock,        gradient: 'bg-gradient-to-br from-amber-400 to-orange-500' },
    { label: 'Approved Students', key: 'approvedStudents', icon: CheckCircle,  gradient: 'bg-gradient-to-br from-emerald-accent to-teal-600' },
    { label: 'Rejected Students', key: 'rejectedStudents', icon: XCircle,      gradient: 'bg-gradient-to-br from-red-500 to-rose-600' },
  ];

  return (
    <AdminLayout>
      <div className="px-4 py-8 sm:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">
            Welcome back, {user?.name || 'Admin'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with QuestionHub today.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        {statsError ? (
          <div className="mb-8 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            {statsError}
            <button onClick={loadStats} className="ml-auto font-semibold underline">
              Retry
            </button>
          </div>
        ) : (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <StatCard
                  label={card.label}
                  value={stats?.[card.key]}
                  icon={card.icon}
                  gradient={card.gradient}
                  loading={statsLoading}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Recent Pending Registrations ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-white/10"
        >
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5">
            <div>
              <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
                Recent Pending Registrations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Students awaiting your approval
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { loadStats(); loadPending(); }}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-500 dark:hover:bg-white/5"
                title="Refresh"
              >
                <RefreshCw size={15} />
              </button>
              <Link
                to="/admin/students"
                className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Table */}
          {pendingLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 px-6 py-4">
                  <div className="h-4 flex-1 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : pendingError ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              {pendingError}
            </div>
          ) : pending.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-emerald-accent" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No pending registrations
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    <th className="sticky top-0 px-6 py-3">Name</th>
                    <th className="sticky top-0 px-4 py-3">Reg. No.</th>
                    <th className="sticky top-0 hidden px-4 py-3 sm:table-cell">Email</th>
                    <th className="sticky top-0 px-4 py-3">Sem</th>
                    <th className="sticky top-0 hidden px-4 py-3 md:table-cell">Registered</th>
                    <th className="sticky top-0 px-4 py-3">Status</th>
                    <th className="sticky top-0 px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {pending.map((s, idx) => (
                    <tr
                      key={s._id}
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                        idx % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-6 py-3.5 font-medium text-ink dark:text-ink-dark">
                        {s.fullName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {s.registerNumber}
                      </td>
                      <td className="hidden px-4 py-3.5 text-slate-600 dark:text-slate-400 sm:table-cell">
                        {s.email}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400">
                        {s.semester}
                      </td>
                      <td className="hidden px-4 py-3.5 text-slate-500 dark:text-slate-400 md:table-cell">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirm({ studentId: s._id, status: 'Approved', name: s.fullName })}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                            id={`approve-btn-${s._id}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setConfirm({ studentId: s._id, status: 'Rejected', name: s.fullName })}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                            id={`reject-btn-${s._id}`}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Confirm modal ── */}
      {confirm && (
        <ConfirmModal
          message={`${confirm.status === 'Approved' ? 'Approve' : 'Reject'} student "${confirm.name}"?`}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-accent'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AdminLayout>
  );
}
