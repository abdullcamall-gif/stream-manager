"use client";

import { useState } from "react";

type CheckoutPlan = {
  id: string;
  serviceName: string;
  name: string;
  price: number;
};

type CheckoutFlowProps = {
  plans: CheckoutPlan[];
};

const PAYMENT_OPTIONS = ["EMOLA", "MPESA", "BCI", "BIM"] as const;

export function CheckoutFlow({ plans }: CheckoutFlowProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_OPTIONS)[number]>("EMOLA");
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleProofSelected(file: File | null) {
    if (!file) {
      setProofImageUrl("");
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    setProofImageUrl(dataUrl);
  }

  async function submitOrder() {
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          planId,
          paymentMethod,
          proofImageUrl,
        }),
      });

      const result = (await response.json()) as
        | { id: string; status: string }
        | { error: string };

      if (!response.ok || "error" in result) {
        setStatusMessage(
          "error" in result ? result.error : "Nao foi possivel criar o pedido.",
        );
        return;
      }

      setStatusMessage(`Pedido criado com sucesso! Status: ${result.status}`);
    } catch {
      setStatusMessage("Erro ao enviar pedido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-8">
      <h2 className="text-2xl font-semibold">Checkout</h2>
      <p className="mt-2 text-sm text-slate-300">Finalize seu pedido em 3 passos.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStep(value)}
            className={`rounded-full px-3 py-1 text-sm ${
              step === value ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-200"
            }`}
          >
            Passo {value}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Nome
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
            />
          </label>
          <label className="text-sm">
            Telefone
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+25884xxxxxxx"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Plano
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.serviceName} - {plan.name} (MZN {plan.price.toFixed(0)})
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Metodo de pagamento
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as (typeof PAYMENT_OPTIONS)[number])
              }
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 rounded-xl bg-slate-900 p-4 text-sm">
          <p className="font-medium">Resumo</p>
          <p className="mt-2 text-slate-300">Nome: {name || "-"}</p>
          <p className="text-slate-300">Telefone: {phone || "-"}</p>
          <p className="text-slate-300">
            Plano: {plans.find((plan) => plan.id === planId)?.name ?? "-"}
          </p>
          <p className="text-slate-300">Pagamento: {paymentMethod}</p>
          <div className="mt-4">
            <label className="text-sm">
              Comprovante (upload)
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void handleProofSelected(file);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-slate-400">
              O envio do pedido exige comprovante.
            </p>
            {proofImageUrl ? (
              <div className="mt-3">
                <p className="mb-2 text-xs text-slate-400">Preview do comprovante</p>
                <img
                  src={proofImageUrl}
                  alt="Comprovante enviado"
                  className="max-h-48 rounded-lg border border-slate-700 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setProofImageUrl("")}
                  className="mt-2 text-xs text-rose-300 underline"
                >
                  Remover comprovante
                </button>
              </div>
            ) : null}
            <button
              type="button"
              disabled={isSubmitting || !proofImageUrl}
              onClick={() => void submitOrder()}
              className="mt-4 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            >
              {isSubmitting ? "Enviando..." : "Finalizar pedido"}
            </button>
            {statusMessage ? <p className="mt-3 text-sm text-cyan-300">{statusMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
