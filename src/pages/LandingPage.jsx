import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, Download, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PrimaryButton from '@/components/PrimaryButton';
import FeatureCard from '@/components/FeatureCard';
import PaperStackIllustration from '@/components/PaperStackIllustration';
import { SEMESTER_OPTIONS } from '@/utils/subjects';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description: 'Sign in with your official SRM credentials. Every request is verified before any paper is unlocked.',
  },
  {
    icon: GraduationCap,
    title: 'Organized by Semester',
    description: 'Every subject across all 8 semesters of the BPT program is organized in one place.',
  },
  {
    icon: Search,
    title: 'Easy to Find',
    description: 'Pick your semester, then your subject — no digging through scattered PDFs in group chats.',
  },
  {
    icon: Download,
    title: 'Download & Save',
    description: 'Download the full question bank for a subject as one PDF, or save it to revisit later.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-500/[0.06]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-400"
            >
              SRM Institute of Science &amp; Technology &middot; Physiotherapy
            </motion.span>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink dark:text-ink-dark sm:text-6xl"
            >
              Question<span className="text-brand-500">Hub</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400"
            >
              Your trusted academic repository for previous year question
              papers &mdash; built exclusively for SRM Physiotherapy (BPT)
              students.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <PrimaryButton as={Link} to="/student/login" variant="primary">
                Student Login
              </PrimaryButton>
              <PrimaryButton as={Link} to="/admin/login" variant="outline">
                Admin Login
              </PrimaryButton>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-6 text-sm text-slate-500 dark:text-slate-500"
            >
              New here?{' '}
              <Link to="/register" className="font-semibold text-brand-500 hover:underline">
                Create a student account
              </Link>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <PaperStackIllustration />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-accent">
            Why QuestionHub
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-4xl">
            Everything you need before exam week
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            A single, official place to find, and download previous year
            question papers for every BPT subject.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* Semester coverage */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-accent p-8 text-white shadow-xl sm:p-10"
        >
          <div className="perforation absolute inset-0 opacity-10" />
          <div className="relative z-10">
            <span className="font-mono text-xs tracking-widest opacity-80">BPT &middot; ALL SEMESTERS</span>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Complete coverage, Semester 1 through 8
            </h3>
            <p className="mt-2 max-w-xl text-sm text-white/85">
              Every subject in the Physiotherapy curriculum is organized by
              semester, with one consolidated question paper PDF per subject.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SEMESTER_OPTIONS.map((sem) => (
                <span
                  key={sem.value}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
                >
                  {sem.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
