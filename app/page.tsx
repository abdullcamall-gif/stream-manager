import { PlanCard } from "@/app/components/plan-card";
import { listCatalogPlans, listCatalogServices } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, plans] = await Promise.all([
    listCatalogServices(),
    listCatalogPlans(),
  ]);

  const plansByService = new Map<string, typeof plans>();
  for (const service of services) {
    plansByService.set(service.id, []);
  }
  for (const plan of plans) {
    const current = plansByService.get(plan.serviceId) ?? [];
    current.push(plan);
    plansByService.set(plan.serviceId, current);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-cyan-50 to-white px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
            Elber Streaming
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Catalogo de Servicos e Planos
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Escolha o melhor plano para voce. Exibimos apenas servicos ativos.
          </p>
        </header>

        <section className="mt-8 space-y-8">
          {services.map((service) => {
            const servicePlans = plansByService.get(service.id) ?? [];

            return (
              <div key={service.id} className="rounded-2xl bg-white/70 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">{service.name}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {servicePlans.length} plano(s)
                  </span>
                </div>

                {servicePlans.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">
                    Nenhum plano disponivel no momento.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {servicePlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        serviceName={plan.serviceName}
                        name={plan.name}
                        price={plan.price}
                        durationInDays={plan.durationInDays}
                        maxSlots={plan.maxSlots}
                        isShared={plan.isShared}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
