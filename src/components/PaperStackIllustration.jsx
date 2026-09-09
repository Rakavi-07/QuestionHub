import { motion } from 'framer-motion';
import { FileText, GraduationCap, Stethoscope, Activity } from 'lucide-react';

const papers = [
  { rotate: -8, x: -30, y: 10, label: 'BPT301', tone: 'from-brand-500 to-brand-600' },
  { rotate: 4, x: 20, y: -6, label: 'BPT402', tone: 'from-indigo-accent to-brand-600' },
  { rotate: -2, x: -6, y: -20, label: 'BPT205', tone: 'from-emerald-accent to-brand-500' },
];

export default function PaperStackIllustration({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-72 w-72 sm:h-96 sm:w-96"
      >
        {/* Base glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500/20 via-indigo-accent/10 to-emerald-accent/20 blur-2xl" />

        {/* Fanned question paper cards */}
        {papers.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotate }}
            transition={{ duration: 0.6, delay: 0.15 * i }}
            style={{
              translateX: p.x,
              translateY: p.y,
            }}
            className={`perforation absolute left-1/2 top-1/2 h-52 w-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/40 bg-gradient-to-br ${p.tone} text-white shadow-2xl sm:h-64 sm:w-48`}
          >
            <div className="ruled-edge flex h-full w-full flex-col justify-between rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <FileText size={18} className="opacity-90" />
                <span className="font-mono text-[10px] tracking-widest opacity-80">
                  {p.label}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-3/4 rounded-full bg-white/40" />
                <div className="h-1.5 w-1/2 rounded-full bg-white/30" />
                <div className="h-1.5 w-5/6 rounded-full bg-white/30" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Floating icon badges */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute -right-2 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-xl dark:bg-slate-800 dark:text-brand-400"
        >
          <GraduationCap size={22} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute -left-2 bottom-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-accent shadow-xl dark:bg-slate-800"
        >
          <Stethoscope size={20} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          className="absolute bottom-0 right-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-indigo-accent shadow-xl dark:bg-slate-800"
        >
          <Activity size={18} />
        </motion.div>
      </motion.div>
    </div>
  );
}
