import { Link } from "wouter";
import { motion } from "framer-motion";
import { Megaphone, Shield, Zap, Lock, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { usePageTitle } from "@/hooks/use-page-title";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  usePageTitle("Inicio");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl text-slate-600 dark:text-slate-400 hover:text-primary transition-all"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>

      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm font-bold text-slate-600 dark:text-slate-400 mb-8">
          <Shield className="w-4 h-4 text-emerald-500" />
          Plataforma de Votación Empresarial Segura
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          La Forma Moderna de <br className="hidden md:block" />
          <span className="text-gradient">Gestionar Elecciones</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
          Cree campañas, gestione candidatos y recopile votos de forma segura
          con nuestra interfaz PWA protegida criptográficamente.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 dark:hover:bg-slate-200 hover:-translate-y-1 transition-all"
          >
            Panel de Administración
          </Link>
          <div className="w-full sm:w-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <Link
              href="/vote/example"
              className="relative w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all"
            >
              Ver Demo de Votación{" "}
              <Megaphone className="w-5 h-5 text-primary" />
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 relative z-10"
      >
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
            Identificación Única
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Los votantes se autentican de forma segura garantizando exactamente
            un voto por persona por campaña.
          </p>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
            Configuración Instantánea
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Implemente un enlace de votación personalizado con candidatos y
            descripciones en segundos.
          </p>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
            Registros Inmutables
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Todos los registros de votación se almacenan de forma segura con
            estrictas restricciones de integridad.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
