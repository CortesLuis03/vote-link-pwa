import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCampaignByLink } from "@/hooks/use-campaigns";
import { useCandidates } from "@/hooks/use-candidates";
import { useSubmitVote } from "@/hooks/use-votes";
import { useRoute } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Lock, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function VotingBooth() {
  const [, params] = useRoute("/vote/:uniqueLink");
  const uniqueLink = params?.uniqueLink || "";

  const { data: campaign, isLoading: loadingCampaign, error: campaignError } = useCampaignByLink(uniqueLink);
  const { data: candidates, isLoading: loadingCandidates } = useCandidates(campaign?.id);
  const { mutate: submitVote, isPending: submitting, error: voteError } = useSubmitVote();

  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [voterId, setVoterId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const isActive = campaign?.status === 'active';
  const now = new Date();
  const isTimeValid = campaign ? (new Date(campaign.startDate) <= now && new Date(campaign.endDate) >= now) : false;
  const canVote = isActive && isTimeValid;

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !selectedCandidate || !voterId.trim()) return;

    submitVote(
      {
        campaignId: campaign.id,
        candidateId: selectedCandidate,
        voterIdentification: voterId.trim(),
      },
      {
        onSuccess: () => {
          setHasVoted(true);
          triggerConfetti();
        },
      }
    );
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  if (loadingCampaign) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Verificando conexión segura...</p>
        </div>
      </PublicLayout>
    );
  }

  if (campaignError || !campaign) {
    return (
      <PublicLayout>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Campaña No Encontrada</h2>
          <p className="text-slate-600 dark:text-slate-400">El enlace de votación que siguió no es válido o ha caducado. Por favor, consulte con el administrador de la elección.</p>
        </div>
      </PublicLayout>
    );
  }

  if (hasVoted) {
    return (
      <PublicLayout>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-200 dark:border-slate-800 shadow-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">¡Voto Registrado!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
            Su participación ha sido procesada correctamente. <br className="hidden sm:block" />
            Gracias por participar en <span className="font-bold text-slate-900 dark:text-white">{campaign.title}</span>.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 justify-center text-slate-500 dark:text-slate-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Hash de Voto Generado de forma Segura</span>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Campaign Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          {campaign.title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          {campaign.description}
        </p>
        
        {!canVote && (
          <div className="mt-8 inline-flex items-center gap-3 px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-400 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
            <div className="text-left">
              <p className="font-bold">La votación está actualmente cerrada.</p>
              <p className="text-sm opacity-90">Por favor, vuelva a consultar durante el período de votación designado.</p>
            </div>
          </div>
        )}
      </div>

      {canVote && (
        <div className="w-full">
          {/* Candidates Grid */}
          <div className="mb-8">
            <h3 className="font-display font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md">1</span>
              Seleccione su candidato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {loadingCandidates ? (
            [1, 2].map(i => <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />)
          ) : candidates?.map((candidate) => (
            <div 
              key={candidate.id}
              onClick={() => canVote && setSelectedCandidate(candidate.id)}
              className={`
                group relative bg-white dark:bg-slate-900 rounded-3xl border-2 transition-all p-6 cursor-pointer overflow-hidden
                ${selectedCandidate === candidate.id 
                  ? "border-primary ring-4 ring-primary/10 shadow-xl shadow-primary/10" 
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm"}
                ${!canVote ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <div className="flex gap-5">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  {candidate.imageUrl ? (
                    <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  {selectedCandidate === candidate.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{candidate.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">{candidate.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
          </div>

          {/* Voting Action Section */}
          <AnimatePresence>
            {selectedCandidate && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="sticky bottom-6 z-50 mt-12 w-full max-w-2xl mx-auto"
              >
                <motion.div 
          layout
          className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative z-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-xl text-slate-900 dark:text-white italic">Confirmar Identidad</h4>
          </div>

          <form onSubmit={handleVoteSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-3 ml-1">Número de Identificación</label>
              <input 
                required
                disabled={!canVote}
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                placeholder="Introduzca su ID oficial..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white font-bold"
              />
            </div>

            {voteError && (
              <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-900/50 rounded-xl p-4 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{(voteError as any).message || "Algo salió mal. Verifique su ID."}</p>
              </div>
            )}
                    <button
                      type="submit"
                      disabled={submitting || !voterId.trim()}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Emitir Voto"}
                    </button>
                  </form>
                  <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Este voto es definitivo y está vinculado de forma segura a su ID.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </PublicLayout>
  );
}
