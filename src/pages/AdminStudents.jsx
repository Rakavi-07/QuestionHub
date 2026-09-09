import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { fetchStudents, updateStudentStatus } from '@/api/admin';

/* ─── helpers ──────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
  { value: '',         label: 'All Statuses' },
  { value: 'Pending',  label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

const SEMESTER_OPTIONS = [
  { value: '',  label: 'All Semesters' },
  ...Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    label: `Semester ${i + 1}`,
  })),
];

function StatusBadge({ status }) {
  const styles = {
    Pending:  'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Rejected: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || ''}`}>
      {status}
    </span>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ─── Confirm modal ─────────────────────────────────────────────── */
function ConfirmModal({ message, confirmLabel, confirmClass, onConfirm, onCancel, loading }) {
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
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Student Details Modal ─────────────────────────────────────── */
function StudentDetailsModal({ student, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="mb-5 font-display text-lg font-bold text-ink dark:text-ink-dark">
          Student Details
        </h2>

        <div className="space-y-3">
          {[
            { label: 'Full Name',        value: student.fullName },
            { label: 'Register Number',  value: student.registerNumber, mono: true },
            { label: 'Email',            value: student.email },
            { label: 'Semester',         value: student.semester },
            { label: 'Status',           isStatus: true },
            { label: 'Registered',       value: fmt(student.createdAt) },
            { label: 'Last Updated',     value: student.updatedAt ? fmt(student.updatedAt) : '—' },
          ].map(({ label, value, mono, isStatus }) => (
            <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-white/5">
              <span className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
              </span>
              {isStatus ? (
                <StatusBadge status={student.status} />
              ) : (
                <span className={`text-sm text-right text-ink dark:text-ink-dark ${mono ? 'font-mono' : ''}`}>
                  {value}
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

/* ─── Skeleton row ──────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </td>
      ))}
    </tr>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function AdminStudents() {
  const [students, setStudents]         = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const limit                           = 10;

  const [viewStudent, setViewStudent]   = useState(null);
  const [confirm, setConfirm]           = useState(null); // { student, nextStatus }
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]               = useState(null);

  const debounceTimer = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter)    params.status   = statusFilter;
      if (semesterFilter)  params.semester  = semesterFilter;

      const { data } = await fetchStudents(params);
      setStudents(data.students || []);
      setPagination(data.pagination || null);
    } catch {
      setError('Unable to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, semesterFilter]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [statusFilter, semesterFilter]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleConfirmAction() {
    if (!confirm) return;
    setActionLoading(true);
    try {
      await updateStudentStatus(confirm.student._id, confirm.nextStatus);
      showToast(`Student ${confirm.nextStatus === 'Approved' ? 'approved' : confirm.nextStatus === 'Rejected' ? 'rejected' : 'updated'} successfully.`);
      setConfirm(null);
      loadStudents();
    } catch {
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
    setSemesterFilter('');
    setPage(1);
  }

  const hasActiveFilters = search || statusFilter || semesterFilter;

  return (
    <AdminLayout>
      <div className="px-4 py-8 sm:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">
            Student Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage QuestionHub student registrations and approvals.
          </p>
        </motion.div>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          {/* Search */}
          <div className="relative min-w-0 flex-1" style={{ minWidth: 200 }}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, reg. no., email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="student-search-input"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            id="status-filter-select"
            style={{ colorScheme: 'light dark' }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition hover:border-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Semester filter */}
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            id="semester-filter-select"
            style={{ colorScheme: 'light dark' }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition hover:border-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark"
          >
            {SEMESTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Clear + Refresh */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <X size={13} /> Clear
            </button>
          )}
          <button
            onClick={loadStudents}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-brand-400 hover:text-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </motion.div>

        {/* ── Table container ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-white/10"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle size={32} className="text-red-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
              <button
                onClick={loadStudents}
                className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    <th className="sticky top-0 px-6 py-3.5">Student</th>
                    <th className="sticky top-0 px-4 py-3.5">Register No.</th>
                    <th className="sticky top-0 hidden px-4 py-3.5 md:table-cell">Email</th>
                    <th className="sticky top-0 px-4 py-3.5 text-center">Sem</th>
                    <th className="sticky top-0 px-4 py-3.5">Status</th>
                    <th className="sticky top-0 hidden px-4 py-3.5 lg:table-cell">Registered</th>
                    <th className="sticky top-0 px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Users size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          No students found.
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="mt-2 text-xs text-brand-500 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    students.map((s, idx) => (
                      <tr
                        key={s._id}
                        className={`group transition-colors hover:bg-brand-50/40 dark:hover:bg-white/[0.04] ${
                          idx % 2 !== 0 ? 'bg-slate-50/60 dark:bg-white/[0.02]' : ''
                        }`}
                      >
                        {/* Student name */}
                        <td className="px-6 py-3.5">
                          <span className="font-medium text-ink dark:text-ink-dark">{s.fullName}</span>
                        </td>

                        {/* Register number */}
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {s.registerNumber}
                        </td>

                        {/* Email */}
                        <td className="hidden px-4 py-3.5 text-slate-600 dark:text-slate-400 md:table-cell">
                          {s.email}
                        </td>

                        {/* Semester */}
                        <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400">
                          {s.semester}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={s.status} />
                        </td>

                        {/* Registered */}
                        <td className="hidden px-4 py-3.5 text-slate-500 dark:text-slate-400 lg:table-cell">
                          {fmt(s.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => setViewStudent(s)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand-500 dark:hover:bg-white/5"
                              title="View details"
                              id={`view-btn-${s._id}`}
                            >
                              <Eye size={15} />
                            </button>

                            {/* Approve — shown when Pending or Rejected */}
                            {(s.status === 'Pending' || s.status === 'Rejected') && (
                              <button
                                onClick={() => setConfirm({ student: s, nextStatus: 'Approved' })}
                                className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                                id={`approve-btn-${s._id}`}
                              >
                                <span className="flex items-center gap-1"><CheckCircle size={12} /> Approve</span>
                              </button>
                            )}

                            {/* Reject — shown when Pending or Approved */}
                            {(s.status === 'Pending' || s.status === 'Approved') && (
                              <button
                                onClick={() => setConfirm({ student: s, nextStatus: 'Rejected' })}
                                className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                id={`reject-btn-${s._id}`}
                              >
                                <span className="flex items-center gap-1"><XCircle size={12} /> Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {!error && pagination && pagination.total > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 dark:border-white/5 sm:flex-row">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold text-ink dark:text-ink-dark">
                  {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-ink dark:text-ink-dark">
                  {pagination.total}
                </span>{' '}
                students
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                  id="prev-page-btn"
                >
                  <ChevronLeft size={13} /> Previous
                </button>

                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  Page {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                  id="next-page-btn"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Student details modal ── */}
      <AnimatePresence>
        {viewStudent && (
          <StudentDetailsModal student={viewStudent} onClose={() => setViewStudent(null)} />
        )}
      </AnimatePresence>

      {/* ── Confirm modal ── */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            message={`${confirm.nextStatus === 'Approved' ? 'Approve' : 'Reject'} student "${confirm.student.fullName}"?`}
            confirmLabel={confirm.nextStatus === 'Approved' ? 'Approve' : 'Reject'}
            confirmClass={
              confirm.nextStatus === 'Approved'
                ? 'bg-emerald-500 shadow-emerald-500/25 hover:bg-emerald-600'
                : 'bg-red-500 shadow-red-500/25 hover:bg-red-600'
            }
            onConfirm={handleConfirmAction}
            onCancel={() => setConfirm(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-accent'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
