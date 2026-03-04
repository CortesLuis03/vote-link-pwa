import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export function AdminLayout({ children, title, action }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isLoading && !user && location !== "/admin/login") {
      setLocation("/admin/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading || (!user && location !== "/admin/login")) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const navItems = [
    { label: "Panel de Control", href: "/admin", icon: LayoutDashboard },
    { label: "Nueva Campaña", href: "/admin/campaigns/new", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
            VoteAdmin
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }
                `}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-400"}`}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-all"
          >
            <div className="flex items-center gap-3">
              {theme === "light" ? (
                <>
                  <Moon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium">Modo Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-medium">Modo Claro</span>
                </>
              )}
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${theme === "dark" ? "bg-primary" : "bg-slate-200"}`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${theme === "dark" ? "left-4" : "left-0.5"}`}
              />
            </div>
          </button>

          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between group">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                {user?.username}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg dark:text-white">
            VoteAdmin
          </span>
        </header>

        {/* Page Header */}
        <div className="px-8 py-8 md:py-10 max-w-6xl mx-auto w-full flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {title}
          </motion.h1>
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {action}
            </motion.div>
          )}
        </div>

        {/* Page Content */}
        <div className="px-8 pb-12 max-w-6xl mx-auto w-full flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
