import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Bookmark,
  BookmarkCheck,
  LogOut,
  GraduationCap,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '@/components/ThemeToggle';
import { getUser, logout } from '@/utils/auth';
import { getSubjectsForSemester } from '@/utils/subjects';
import {
  fetchStudentQuestionPapers,
  fetchSavedPapers,
  saveQuestionPaper,
  unsaveQuestionPaper,
} from '@/api/studentQuestionPapers';

// ── Download Helper ────────────────────────────────────────────────
/**
 * Fetch the PDF as a binary blob and trigger a proper browser download.
 * This avoids simply navigating to the URL (which would open rather than download).
 */
async function downloadPdfBlob(fileUrl, fileName) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status}`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName || 'question-paper.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Release the object URL after a short delay so the browser can finish
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
}

// ── Loading Skeleton ───────────────────────────────────────────────
function SubjectSkeleton() {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-0 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-3.5 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

// ── Toast Notification ─────────────────────────────────────────────
function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl ${
        type === 'error' ? 'bg-red-500 shadow-red-500/25' : 'bg-emerald-accent shadow-emerald-500/25'
      }`}
    >
      {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
    </motion.div>
  );
}

// ── Saved Paper Card ───────────────────────────────────────────────
function SavedPaperCard({ paper, onOpen, onDownload, onRemove, downloadingId }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      className="group relative rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-colors hover:border-brand-300 hover:bg-blue-50/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-block rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            {paper.subjectCode}
          </span>
          <p className="mt-1 text-xs font-semibold text-ink dark:text-ink-dark line-clamp-2">
            {paper.subjectName}
          </p>
        </div>
        <button
          onClick={() => onRemove(paper._id)}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="Remove from saved"
          aria-label={`Remove ${paper.subjectCode} from saved`}
        >
          <X size={14} />
        </button>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          onClick={() => onOpen(paper.fileUrl)}
          className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-400 hover:text-brand-600 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:ring-brand-400"
        >
          <ExternalLink size={12} /> Open
        </button>
        <button
          onClick={() => onDownload(paper._id, paper.fileUrl, paper.subjectCode)}
          disabled={downloadingId === paper._id}
          className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:ring-brand-400 hover:text-brand-600 disabled:opacity-60 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:ring-brand-400"
        >
          {downloadingId === paper._id ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Download size={12} />
          )}
          Download
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function StudentDashboard() {
  const { theme, toggleTheme } = useTheme();
  const user = getUser(); // from localStorage

  const semester = user?.semester;
  const subjectsForSemester = semester ? getSubjectsForSemester(semester) : [];

  // ── State ──────────────────────────────────────────────────────
  const [papers, setPapers] = useState([]);       // uploaded papers from backend
  const [savedPapers, setSavedPapers] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set()); // Set of paper _ids that are saved

  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);  // which paper is currently being saved/unsaved
  const [downloadingId, setDownloadingId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // ── Toast helper ──────────────────────────────────────────────
  function showToast(message, type = 'success') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  // ── Fetch uploaded papers ─────────────────────────────────────
  const loadPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchStudentQuestionPapers();
      setPapers(data.papers || []);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Unable to load question papers.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch saved papers ────────────────────────────────────────
  const loadSavedPapers = useCallback(async () => {
    setSavedLoading(true);
    try {
      const { data } = await fetchSavedPapers();
      const saved = data.savedPapers || [];
      setSavedPapers(saved);
      setSavedIds(new Set(saved.map((p) => p._id)));
    } catch {
      // Silent fail — saved papers are non-critical
    } finally {
      setSavedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPapers();
    loadSavedPapers();
  }, [loadPapers, loadSavedPapers]);

  // ── Save / Unsave ─────────────────────────────────────────────
  async function handleToggleSave(paper) {
    if (savingId) return;
    const alreadySaved = savedIds.has(paper._id);
    setSavingId(paper._id);
    try {
      if (alreadySaved) {
        await unsaveQuestionPaper(paper._id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(paper._id);
          return next;
        });
        setSavedPapers((prev) => prev.filter((p) => p._id !== paper._id));
        showToast('Removed from saved papers.');
      } else {
        await saveQuestionPaper(paper._id);
        setSavedIds((prev) => new Set(prev).add(paper._id));
        setSavedPapers((prev) => {
          // Avoid duplicates
          if (prev.some((p) => p._id === paper._id)) return prev;
          return [...prev, paper];
        });
        showToast('Paper saved successfully.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || (alreadySaved ? 'Failed to remove.' : 'Failed to save.');
      showToast(msg, 'error');
    } finally {
      setSavingId(null);
    }
  }

  // ── Unsave from saved section ─────────────────────────────────
  async function handleRemoveSaved(paperId) {
    setSavingId(paperId);
    try {
      await unsaveQuestionPaper(paperId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(paperId);
        return next;
      });
      setSavedPapers((prev) => prev.filter((p) => p._id !== paperId));
      showToast('Removed from saved papers.');
    } catch {
      showToast('Failed to remove saved paper.', 'error');
    } finally {
      setSavingId(null);
    }
  }

  // ── Download ──────────────────────────────────────────────────
  async function handleDownload(paperId, fileUrl, subjectCode) {
    setDownloadingId(paperId);
    try {
      await downloadPdfBlob(fileUrl, `${subjectCode}-question-paper.pdf`);
      showToast('Download started.');
    } catch {
      showToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  }

  // ── Open in new tab ───────────────────────────────────────────
  function handleOpen(fileUrl) {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }

  // ── Derived: merge curriculum subjects with uploaded papers ───
  const mergedSubjects = subjectsForSemester.map((subject) => {
    const uploaded = papers.find((p) => p.subjectCode === subject.code);
    return { ...subject, uploaded: uploaded || null };
  });

  const filteredSubjects = mergedSubjects.filter((subject) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      subject.code.toLowerCase().includes(q) ||
      subject.name.toLowerCase().includes(q)
    );
  });

  const uploadedCount = mergedSubjects.filter((s) => s.uploaded).length;

  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-paper-dark">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-4 py-3.5 backdrop-blur-md dark:border-white/10 dark:bg-paper-dark/90 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-accent text-white shadow-md shadow-brand-500/25">
            <BookMarked size={16} />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-ink dark:text-ink-dark">
            Question<span className="text-brand-500">Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => logout({ redirect: true })}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            id="student-logout-btn"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Hero Welcome Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-200/70 bg-gradient-to-r from-brand-500/5 via-indigo-accent/5 to-transparent px-4 py-5 dark:border-white/10 sm:px-6"
      >
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-accent text-white shadow-lg shadow-brand-500/25">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Welcome back</p>
                <h1 className="font-display text-lg font-bold tracking-tight text-ink dark:text-ink-dark">
                  {user?.fullName || 'Student'}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Semester badge */}
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 dark:border-brand-500/30 dark:bg-brand-500/10">
              <BookMarked size={14} className="text-brand-500" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                  Registered Semester
                </p>
                <p className="font-display text-base font-bold text-brand-600 dark:text-brand-400">
                  Semester {semester}
                </p>
              </div>
            </div>

            {/* Stats badge */}
            {!loading && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <CheckCircle size={14} className="text-emerald-500" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                    Papers Available
                  </p>
                  <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {uploadedCount} / {subjectsForSemester.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:flex lg:gap-6">
        {/* ── Left: Subject List ── */}
        <div className="lg:min-w-0 lg:flex-1">
          {/* Search + Refresh row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-5 flex items-center gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by subject name or code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-ink-dark dark:placeholder-slate-600"
                id="subject-search"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => { loadPapers(); loadSavedPapers(); }}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-brand-400 hover:text-brand-500 dark:border-slate-700 dark:bg-slate-900"
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </motion.div>

          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-4"
          >
            <h2 className="font-display text-base font-bold text-ink dark:text-ink-dark">
              Semester {semester} — Question Papers
            </h2>
            {!loading && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {search
                  ? `${filteredSubjects.length} of ${subjectsForSemester.length} subjects`
                  : `${subjectsForSemester.length} subjects`}
              </p>
            )}
          </motion.div>

          {/* Subject cards panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-white/10"
          >
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle size={32} className="mb-3 text-red-400" />
                <p className="mb-1 text-sm font-semibold text-ink dark:text-ink-dark">
                  Unable to load papers
                </p>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">{error}</p>
                <button
                  onClick={loadPapers}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {[...Array(subjectsForSemester.length || 5)].map((_, i) => (
                  <SubjectSkeleton key={i} />
                ))}
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText size={36} className="mb-3 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {search ? 'No matching subjects found.' : 'No subjects available for your semester.'}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="mt-3 text-xs text-brand-500 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                <AnimatePresence initial={false}>
                  {filteredSubjects.map((subject, idx) => {
                    const isSaved = savedIds.has(subject.uploaded?._id);
                    const isCurrentlySaving = savingId === subject.uploaded?._id;
                    const isDownloading = downloadingId === subject.uploaded?._id;

                    return (
                      <motion.div
                        key={subject.code}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex flex-col gap-3 p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        {/* Subject info */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                              {subject.code}
                            </span>
                            <h3 className="truncate font-semibold text-ink dark:text-ink-dark">
                              {subject.name}
                            </h3>
                          </div>

                          {subject.uploaded ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <CheckCircle size={13} className="shrink-0 text-emerald-500" />
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Question Paper Available
                              </span>
                              <span>•</span>
                              <span>
                                Updated{' '}
                                {new Date(subject.uploaded.updatedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                              Question paper not available yet
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        {subject.uploaded && (
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Open PDF */}
                            <a
                              href={subject.uploaded.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
                              id={`open-${subject.code}`}
                            >
                              <ExternalLink size={13} />
                              Open PDF
                            </a>

                            {/* Download */}
                            <button
                              onClick={() =>
                                handleDownload(
                                  subject.uploaded._id,
                                  subject.uploaded.fileUrl,
                                  subject.code
                                )
                              }
                              disabled={isDownloading}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
                              id={`download-${subject.code}`}
                            >
                              {isDownloading ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Download size={13} />
                              )}
                              Download
                            </button>

                            {/* Save / Unsave */}
                            <button
                              onClick={() => handleToggleSave(subject.uploaded)}
                              disabled={isCurrentlySaving}
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:opacity-60 ${
                                isSaved
                                  ? 'bg-brand-500 text-white hover:bg-brand-600'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                              id={`save-${subject.code}`}
                            >
                              {isCurrentlySaving ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : isSaved ? (
                                <BookmarkCheck size={13} />
                              ) : (
                                <Bookmark size={13} />
                              )}
                              {isSaved ? 'Saved' : 'Save'}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Empty state when no papers uploaded for semester */}
          {!loading && !error && mergedSubjects.every((s) => !s.uploaded) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 rounded-xl bg-amber-50 px-5 py-3.5 text-sm font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            >
              No question papers have been uploaded for your semester yet. Check back soon.
            </motion.p>
          )}
        </div>

        {/* ── Right: Saved Papers Sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 lg:mt-0 lg:w-72 lg:flex-shrink-0"
        >
          <div className="sticky top-24 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-900 dark:ring-white/10">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
              <div className="flex items-center gap-2">
                <BookmarkCheck size={16} className="text-brand-500" />
                <h2 className="font-display text-sm font-bold text-ink dark:text-ink-dark">
                  Saved Papers
                </h2>
              </div>
              {savedPapers.length > 0 && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {savedPapers.length}
                </span>
              )}
            </div>

            <div className="max-h-[480px] overflow-y-auto p-3">
              {savedLoading ? (
                <div className="space-y-2.5 p-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : savedPapers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bookmark size={28} className="mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    You haven't saved any question papers yet.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300 dark:text-slate-600">
                    Use the Save button on any available paper.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {savedPapers.map((paper) => (
                      <SavedPaperCard
                        key={paper._id}
                        paper={paper}
                        onOpen={handleOpen}
                        onDownload={handleDownload}
                        onRemove={handleRemoveSaved}
                        downloadingId={downloadingId}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </main>

      {/* ── Toast Notifications ── */}
      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
