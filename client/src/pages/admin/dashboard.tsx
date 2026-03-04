import { AdminLayout } from "@/components/layout/AdminLayout";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Link } from "wouter";
import { Plus, Calendar, Users, ArrowRight, Activity, Archive } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: campaigns, isLoading } = useCampaigns();

  return (
    <AdminLayout 
      title="Panel de Control" 
      action={
        <Link href="/admin/campaigns/new" className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold
          bg-gradient-to-r from-primary to-primary/90 text-white
          shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 
          hover:-translate-y-0.5 active:translate-y-0 transition-all
        ">
          <Plus className="w-5 h-5" />
          Crear Campaña
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl h-64 animate-pulse border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Aún no hay campañas</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
            Cree su primera campaña de votación para comenzar a recopilar votos de manera segura y fácil.
          </p>
          <Link href="/admin/campaigns/new" className="
            inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
            bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors
          ">
            <Plus className="w-5 h-5" />
            Crear Campaña
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((campaign) => {
            const isActive = campaign.status === "active";
            const isUpcoming = new Date(campaign.startDate) > new Date();
            
            return (
              <div key={campaign.id} className="
                group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover-lift
                flex flex-col
              ">
                {/* Card Header Image/Gradient */}
                <div className="h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {campaign.imageUrl ? (
                    <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${isActive 
                        ? isUpcoming 
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400" 
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}
                    `}>
                      {isActive ? (isUpcoming ? "Próxima" : "Activa") : "Inactiva"}
                    </span>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2 line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 flex-1">
                    {campaign.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{format(new Date(campaign.startDate), "MMM d")} - {format(new Date(campaign.endDate), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  
                  <Link href={`/admin/campaigns/${campaign.id}`} className="
                    flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                    bg-slate-50 dark:bg-slate-800 text-primary font-semibold hover:bg-primary hover:text-white
                    transition-colors duration-300
                  ">
                    Gestionar Campaña
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
