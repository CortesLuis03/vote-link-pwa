import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useCampaign,
  useUpdateCampaign,
  useCampaignResults,
} from "@/hooks/use-campaigns";
import { useTheme } from "@/hooks/use-theme";
import {
  useCandidates,
  useCreateCandidate,
  useUpdateCandidate,
} from "@/hooks/use-candidates";
import { useRoute, Link } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import {
  Copy,
  CheckCircle2,
  UserPlus,
  Users,
  Link as LinkIcon,
  Play,
  Square,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Calendar,
  Trash2,
  Save,
  ChevronLeft,
  Loader2,
  Upload,
  Image as ImageIcon,
  Edit2,
} from "lucide-react";
import { useDeleteCandidate } from "@/hooks/use-candidates";
import { useToast } from "@/hooks/use-toast";

export default function ManageCampaign() {
  const [, params] = useRoute("/admin/campaigns/:id");
  const campaignId = Number(params?.id);

  const { data: campaign, isLoading: loadingCampaign } =
    useCampaign(campaignId);
  const { data: candidates, isLoading: loadingCandidates } =
    useCandidates(campaignId);
  const {
    data: results,
    isLoading: loadingResults,
    error: resultsError,
  } = useCampaignResults(campaignId);
  const { theme } = useTheme();

  if (resultsError)
    console.error("[Frontend] Error loading results:", resultsError);

  const { mutate: updateCampaign, isPending: updatingStatus } =
    useUpdateCampaign();
  const { mutate: createCandidate, isPending: creatingCandidate } =
    useCreateCandidate();
  const { mutate: updateCandidate, isPending: updatingCandidate } =
    useUpdateCandidate();
  const { mutate: deleteCandidate, isPending: deletingCandidate } =
    useDeleteCandidate();
  const { toast } = useToast();

  const totalVotes = useMemo(() => {
    return results?.reduce((acc, curr) => acc + curr.voteCount, 0) || 0;
  }, [results]);

  const [copied, setCopied] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [editingCandidate, setEditingCandidate] = useState<number | null>(null);
  const [uploadingCandidate, setUploadingCandidate] = useState(false);

  const handleCandidateFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingCandidate(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) {
        let errorMsg = "Error al subir imagen";
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error(
            "[Client] Server returned non-JSON error:",
            text.slice(0, 100),
          );
        }
        throw new Error(errorMsg);
      }

      try {
        const data = JSON.parse(text);
        setCandidateForm((prev) => ({ ...prev, imageUrl: data.url }));
      } catch (e) {
        console.error("[Client] Failed to parse success response:", e);
        throw new Error("Respuesta del servidor no válida");
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploadingCandidate(false);
    }
  };

  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editedDates, setEditedDates] = useState({
    startDate: "",
    endDate: "",
  });

  if (loadingCampaign)
    return (
      <AdminLayout title="Cargando...">
        <div className="animate-pulse h-96 bg-white rounded-3xl" />
      </AdminLayout>
    );
  if (!campaign)
    return (
      <AdminLayout title="No Encontrado">
        <p>Campaña no encontrada.</p>
      </AdminLayout>
    );

  const fullLink = `${window.location.origin}/vote/${campaign.uniqueLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = () => {
    const newStatus = campaign.status === "active" ? "inactive" : "active";
    updateCampaign({ id: campaignId, status: newStatus });
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCandidate) {
      updateCandidate(
        { campaignId, id: editingCandidate, data: candidateForm },
        {
          onSuccess: () => {
            setIsAddModalOpen(false);
            setEditingCandidate(null);
            setCandidateForm({ name: "", description: "", imageUrl: "" });
            toast({
              title: "Candidato actualizado",
              description: "Los datos del candidato han sido guardados.",
            });
          },
        },
      );
    } else {
      createCandidate(
        { campaignId, data: candidateForm },
        {
          onSuccess: () => {
            setIsAddModalOpen(false);
            setCandidateForm({ name: "", description: "", imageUrl: "" });
            toast({
              title: "Candidato añadido",
              description: "El candidato ha sido creado exitosamente.",
            });
          },
        },
      );
    }
  };

  const handleOpenEdit = (candidate: any) => {
    setEditingCandidate(candidate.id);
    setCandidateForm({
      name: candidate.name,
      description: candidate.description,
      imageUrl: candidate.imageUrl || "",
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCandidate(null);
    setCandidateForm({ name: "", description: "", imageUrl: "" });
  };

  const handleUpdateDates = () => {
    updateCampaign(
      {
        id: campaignId,
        startDate: new Date(editedDates.startDate),
        endDate: new Date(editedDates.endDate),
      },
      {
        onSuccess: () => {
          setIsEditingDates(false);
          toast({
            title: "Fechas actualizadas",
            description: "El período de votación ha sido modificado.",
          });
        },
      },
    );
  };

  const handleDeleteCandidate = (candidateId: number) => {
    deleteCandidate(
      { campaignId, id: candidateId },
      {
        onSuccess: () => {
          toast({
            title: "Candidato eliminado",
            description: "El candidato ha sido removido exitosamente.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error al eliminar",
            description: error.message || "No se pudo eliminar el candidato.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const startEditingDates = () => {
    if (campaign) {
      setEditedDates({
        startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
        endDate: new Date(campaign.endDate).toISOString().slice(0, 16),
      });
      setIsEditingDates(true);
    }
  };

  return (
    <AdminLayout title={campaign.title}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link href="/admin">
          <a className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-semibold group">
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:border-primary/50 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            Volver al Panel
          </a>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details & Link */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
              Compartir Enlace de Votación
            </h3>

            <div className="flex justify-center mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <QRCodeSVG
                value={fullLink}
                size={180}
                bgColor={theme === "dark" ? "#1e293b" : "#f8fafc"}
                fgColor={theme === "dark" ? "#f8fafc" : "#0f172a"}
                level={"M"}
                includeMargin={false}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm font-mono text-slate-600 dark:text-slate-400 truncate flex-1">
                  {fullLink}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
                  title="Copiar al portapapeles"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <a
                href={`/vote/${campaign.uniqueLink}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Abrir Página Pública <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              Período de Votación
              {!isEditingDates ? (
                <button
                  onClick={startEditingDates}
                  className="text-sm text-primary font-bold hover:underline"
                >
                  Editar
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingDates(false)}
                  className="text-sm text-slate-400 font-bold hover:underline"
                >
                  Cancelar
                </button>
              )}
            </h3>

            {isEditingDates ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={editedDates.startDate}
                    onChange={(e) =>
                      setEditedDates((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary text-sm font-bold text-slate-700 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    Fecha Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={editedDates.endDate}
                    onChange={(e) =>
                      setEditedDates((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary text-sm font-bold text-slate-700 dark:text-slate-200"
                  />
                </div>
                <button
                  onClick={handleUpdateDates}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Inicia el
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                      {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.startDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Finaliza el
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                      {new Date(campaign.endDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
              Estado de la Campaña
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${campaign.status === "active" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-slate-400 dark:bg-slate-600"}`}
                />
                <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">
                  {campaign.status === "active" ? "activa" : "inactiva"}
                </span>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={updatingStatus}
                className={`
                  px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                  ${
                    campaign.status === "active"
                      ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200"
                      : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                  }
                `}
              >
                {campaign.status === "active" ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {campaign.status === "active" ? "Detener Votación" : "Activar"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results & Candidates */}
        <div className="lg:col-span-2 space-y-8">
          {/* Results Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Resultados en Tiempo Real
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Conteo actualizado cada 10 segundos.
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-display font-black text-primary block">
                  {totalVotes}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Votos Totales
                </span>
              </div>
            </div>

            {resultsError ? (
              <div className="p-4 bg-rose-50 border border-secondary rounded-2xl text-rose-700 text-sm">
                <p className="font-bold mb-1">Error al obtener resultados:</p>
                <code className="text-[10px] break-all">
                  {(resultsError as Error).message}
                </code>
              </div>
            ) : loadingResults ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : !results || results.length === 0 ? (
              <div className="py-6 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                Aún no hay candidatos ni votos registrados.
              </div>
            ) : (
              <div className="space-y-6">
                {[...results]
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((result, idx) => {
                    const percentage =
                      totalVotes > 0
                        ? Math.round((result.voteCount / totalVotes) * 100)
                        : 0;
                    const isWinner = idx === 0 && result.voteCount > 0;

                    return (
                      <div key={result.candidateId} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {result.candidateName}
                            </span>
                            {isWinner && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-[10px] font-black uppercase">
                                <TrendingUp className="w-3 h-3" /> Liderando
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-slate-400 dark:text-slate-500">
                            {result.voteCount} votos ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${isWinner ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                Candidatos
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Gestione las opciones que los votantes pueden elegir.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Añadir Candidato
            </button>
          </div>

          {loadingCandidates ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-white dark:bg-slate-900 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : candidates?.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">
                Sin Candidatos
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Añada el primer candidato a esta campaña.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Añadir Candidato
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {candidates?.map((candidate) => {
                const candidateVotes =
                  results?.find((r) => r.candidateId === candidate.id)
                    ?.voteCount || 0;
                const canDelete = candidateVotes === 0;

                return (
                  <div
                    key={candidate.id}
                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-slate-200/50"
                  >
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      {candidate.imageUrl ? (
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all">
                        <button
                          onClick={() => handleOpenEdit(candidate)}
                          className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-primary rounded-xl shadow-lg hover:bg-primary hover:text-white transition-all"
                          title="Editar candidato"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {canDelete ? (
                          <button
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            disabled={deletingCandidate}
                            className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-rose-500 rounded-xl shadow-lg hover:bg-rose-500 hover:text-white transition-all"
                            title="Eliminar candidato"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="p-2 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl shadow-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-[10px] font-black uppercase">
                              Votos
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-display font-bold text-xl text-slate-900 dark:text-white line-clamp-1">
                          {candidate.name}
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-tighter">
                            Votos
                          </span>
                          <span className="font-display font-black text-xs text-primary">
                            {candidateVotes}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm flex-1 line-clamp-2">
                        {candidate.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        title={editingCandidate ? "Editar Candidato" : "Añadir Candidato"}
      >
        <form onSubmit={handleAddCandidate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nombre del Candidato
            </label>
            <input
              required
              value={candidateForm.name}
              onChange={(e) =>
                setCandidateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="ej., Juana Pérez"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Descripción / Plataforma
            </label>
            <textarea
              required
              rows={3}
              value={candidateForm.description}
              onChange={(e) =>
                setCandidateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Breve descripción..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white resize-none"
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              URL de la Foto o Subir un archivo
            </label>

            <div className="flex gap-4">
              <div className="relative group flex-1">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="url"
                  value={candidateForm.imageUrl}
                  onChange={(e) =>
                    setCandidateForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://... o sube una imagen"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
                />
              </div>

              <label className="cursor-pointer flex items-center justify-center p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20">
                {uploadingCandidate ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCandidateFileUpload}
                  disabled={uploadingCandidate}
                />
              </label>
            </div>

            {candidateForm.imageUrl && (
              <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <img
                  src={candidateForm.imageUrl}
                  alt="Candidate Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCandidateForm((prev) => ({ ...prev, imageUrl: "" }))
                  }
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingCandidate || updatingCandidate}
              className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white disabled:opacity-50 transition-colors"
            >
              {creatingCandidate || updatingCandidate
                ? "Guardando..."
                : editingCandidate
                  ? "Guardar Cambios"
                  : "Añadir Candidato"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
