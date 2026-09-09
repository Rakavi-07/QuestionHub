import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  X,
  File,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { SEMESTER_OPTIONS, getSubjectsForSemester } from '@/utils/subjects';
import {
  fetchQuestionPapers,
  uploadQuestionPaper,
  replaceQuestionPaper,
  deleteQuestionPaper,
} from '@/api/questionPapers';
import PrimaryButton from '@/components/PrimaryButton';

// ── Helpers ────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/* ── Confirm Modal ─────────────────────────────────────────────── */
function ConfirmModal({ message, subtext, confirmLabel, confirmClass, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <p className="mb-2 text-base font-semibold text-ink dark:text-ink-dark">{message}</p>
        {subtext && <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{subtext}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Upload Modal ──────────────────────────────────────────────── */
function UploadModal({ subject, isReplace, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      setFile(null);
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setError('File is too large (maximum is 20 MB).');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      if (isReplace) {
        await replaceQuestionPaper(subject.code, formData);
      } else {
        formData.append('semester', subject.semester);
        formData.append('subjectCode', subject.code);
        formData.append('subjectName', subject.name);
        await uploadQuestionPaper(formData);
      }
      onSuccess(isReplace ? 'replaced' : 'uploaded');
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-white/5"
        >
          <X size={18} />
        </button>

        <h2 className="mb-1 font-display text-lg font-bold text-ink dark:text-ink-dark">
          {isReplace ? 'Replace PDF' : 'Upload PDF'}
        </h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-ink dark:text-ink-dark">{subject.code}</span> — {subject.name}
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="mb-6">
          <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
            {file ? (
              <div className="flex flex-col items-center text-center">
                <File size={32} className="mb-2 text-brand-500" />
                <p className="text-sm font-semibold text-ink dark:text-ink-dark">{file.name}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Upload size={32} className="mb-2 text-slate-400" />
                <p className="text-sm font-semibold text-ink dark:text-ink-dark">Click to browse</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF up to 20 MB</p>
              </div>
            )}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={loading} />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? 'Uploading…' : isReplace ? 'Replace' : 'Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function AdminQuestionPapers() {
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0].value);
  const [subjects, setSubjects] = useState([]);
  
  // Array of uploaded papers metadata from backend
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  
  const [uploadSubject, setUploadSubject] = useState(null); // { code, name, semester, isReplace }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // subjectCode
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const loadPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchQuestionPapers({ semester });
      setPapers(data.papers || []);
    } catch {
      setError('Unable to load question papers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [semester]);

  useEffect(() => {
    // Generate base subjects list from curriculum
    const baseSubjects = getSubjectsForSemester(semester).map(s => ({
      ...s,
      semester,
    }));
    setSubjects(baseSubjects);
    setSearch(''); // clear search on semester change
    loadPapers();
  }, [semester, loadPapers]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      await deleteQuestionPaper(deleteConfirm);
      showToast('Question paper deleted successfully.');
      setDeleteConfirm(null);
      loadPapers();
    } catch {
      showToast('Deletion failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Derived state: merge curriculum subjects with uploaded papers + search
  const displaySubjects = subjects
    .map(subj => {
      const uploaded = papers.find(p => p.subjectCode === subj.code);
      return { ...subj, uploaded };
    })
    .filter(subj => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return subj.code.toLowerCase().includes(q) || subj.name.toLowerCase().includes(q);
    });

  return (
    <AdminLayout>
      <div className="px-4 py-8 sm:px-8">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">
            Question Papers
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage previous-year PDFs for the Physiotherapy curriculum.
          </p>
        </motion.div>

        {/* ── Controls ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 flex flex-wrap gap-4">
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
            style={{ colorScheme: 'light dark' }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark"
          >
            {SEMESTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark"
            />
          </div>

          <button
            onClick={loadPapers}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:text-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </motion.div>

        {/* ── Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-white/10"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle size={32} className="mb-3 text-red-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          ) : loading ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : displaySubjects.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {search ? 'No subjects found matching your search.' : 'No subjects available for this semester.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {displaySubjects.map((subject) => (
                <div
                  key={subject.code}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        {subject.code}
                      </span>
                      <h3 className="font-semibold text-ink dark:text-ink-dark">{subject.name}</h3>
                    </div>
                    {subject.uploaded ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">Uploaded</span>
                        <span>•</span>
                        <span>{formatBytes(subject.uploaded.fileSize)}</span>
                        <span>•</span>
                        <span>{new Date(subject.uploaded.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        Not uploaded
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {subject.uploaded ? (
                      <>
                        <a
                          href={subject.uploaded.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-400 hover:text-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <ExternalLink size={14} /> View
                        </a>
                        <button
                          onClick={() => setUploadSubject({ ...subject, isReplace: true })}
                          className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
                        >
                          Replace
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(subject.code)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Delete paper"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <PrimaryButton
                        variant="secondary"
                        className="!py-1.5 !px-3 !text-xs !shadow-none"
                        onClick={() => setUploadSubject({ ...subject, isReplace: false })}
                      >
                        <Upload size={14} /> Upload PDF
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Modals & Toasts ── */}
      <AnimatePresence>
        {uploadSubject && (
          <UploadModal
            subject={uploadSubject}
            isReplace={uploadSubject.isReplace}
            onClose={() => setUploadSubject(null)}
            onSuccess={(action) => {
              setUploadSubject(null);
              showToast(`Question paper ${action} successfully.`);
              loadPapers();
            }}
          />
        )}

        {deleteConfirm && (
          <ConfirmModal
            message={`Delete question paper?`}
            subtext={`This will remove the PDF for ${deleteConfirm}. This action cannot be undone.`}
            confirmLabel="Delete"
            confirmClass="bg-red-500 shadow-red-500/25 hover:bg-red-600 text-white"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteConfirm(null)}
            loading={actionLoading}
          />
        )}

        {toast && (
          <motion.div
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
