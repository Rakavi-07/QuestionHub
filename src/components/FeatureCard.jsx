import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-7 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-500/10 dark:border-white/10 dark:bg-white/5"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/10 to-emerald-accent/10 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-accent text-white shadow-md shadow-brand-500/25">
          <Icon size={22} />
        </div>
        <h3 className="mb-2 font-display text-lg font-semibold tracking-tight text-ink dark:text-ink-dark">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
