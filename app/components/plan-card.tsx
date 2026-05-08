type PlanCardProps = {
  serviceName: string;
  name: string;
  price: number;
  durationInDays: number;
  maxSlots: number;
  isShared: boolean;
};

export function PlanCard({
  serviceName,
  name,
  price,
  durationInDays,
  maxSlots,
  isShared,
}: PlanCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
        {serviceName}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-900">{name}</h3>
      <p className="mt-3 text-3xl font-bold text-slate-950">
        MZN {price.toFixed(0)}
      </p>
      <p className="mt-1 text-sm text-slate-600">Validade: {durationInDays} dias</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-700">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          Slots: {maxSlots}
        </span>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-800">
          {isShared ? "Compartilhado" : "Individual"}
        </span>
      </div>
    </article>
  );
}
