import { motion } from "framer-motion";
import { Megaphone, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Abstract Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
      
      <header className="py-6 px-4 md:px-8 max-w-5xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight">VoteSecure</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm font-semibold text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-800 backdrop-blur-md">
            Portal de Votación Verificado
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-all"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 md:py-12 max-w-5xl mx-auto w-full relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
      
      <footer className="py-8 text-center text-slate-400 dark:text-slate-600 text-sm relative z-10">
        PWA de Votación Segura impulsada por VoteSecure
      </footer>
    </div>
  );
}
