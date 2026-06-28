import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCheck, FiTrash2, FiRotateCcw } from "react-icons/fi";
import { getReviews, approveReview, deleteReview } from "@/admin/lib/adminApi";
import { PageTitle, Panel, Spinner, EmptyState, StatusPill } from "@/admin/components/AdminUI";

export default function Reviews() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reviews"], queryFn: getReviews });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  const approve = useMutation({ mutationFn: approveReview, onSuccess: refresh });
  const del = useMutation({ mutationFn: deleteReview, onSuccess: refresh });

  return (
    <>
      <PageTitle title="Reviews" subtitle="Approve or remove customer reviews" />
      {isLoading ? <Spinner /> : !data?.length ? <EmptyState emoji="⭐" text="No reviews yet." /> : (
        <div className="grid gap-4">
          {data.map((r) => (
            <Panel key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <b className="font-display text-lg text-white">{r.author_name}</b>
                    <span className="text-blush-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <StatusPill status={r.is_approved ? "approved" : "reviewing"} />
                  </div>
                  {r.title && <p className="mt-2 font-medium text-blush-50">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm text-blush-100/70">{r.body}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve.mutate(r.id)}
                    className={`grid h-9 w-9 place-items-center rounded-lg ${r.is_approved ? "bg-white/5 text-blush-200" : "bg-emerald-500/15 text-emerald-300"} hover:opacity-80`}
                    title={r.is_approved ? "Unapprove" : "Approve"}
                  >
                    {r.is_approved ? <FiRotateCcw size={15} /> : <FiCheck size={15} />}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this review?")) del.mutate(r.id); }}
                    className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
