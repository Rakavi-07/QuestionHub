import { Link } from 'react-router-dom';
import { BookMarked, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/60 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-indigo-accent text-white">
                <BookMarked size={16} />
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-ink dark:text-ink-dark">
                Question<span className="text-brand-500">Hub</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              The official previous year question paper repository for SRM
              Institute of Science and Technology&rsquo;s Physiotherapy (BPT)
              program.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-ink dark:text-ink-dark">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li><Link to="/" className="hover:text-brand-500">Home</Link></li>
              <li><Link to="/student/login" className="hover:text-brand-500">Student Login</Link></li>
              <li><Link to="/admin/login" className="hover:text-brand-500">Admin Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-500">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-ink dark:text-ink-dark">
              SRMIST
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin size={14} /> Kattankulathur, Chennai
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> support@srmist.edu.in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} QuestionHub &middot; SRM Institute of Science and Technology</p>
          <p>Built for academic use only</p>
        </div>
      </div>
    </footer>
  );
}
