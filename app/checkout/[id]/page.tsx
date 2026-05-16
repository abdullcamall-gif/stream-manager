"use client";

import React, { useRef, useState } from "react";
import {
  Copy,
  Upload,
  Check,
  Smartphone,
  Landmark,
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  MessageCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const plans = [
  { days: 15, label: "15 DIAS", multiplier: 1 },
  { days: 30, label: "1 MES", multiplier: 1.8 },
  { days: 60, label: "2 MESES", multiplier: 3.2 },
];

const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", icon: Smartphone, color: "bg-[#e11d48]", details: "84 123 4567" },
  { id: "emola", name: "e-Mola", icon: Smartphone, color: "bg-[#f59e0b]", details: "87 987 6543" },
  { id: "bim", name: "BIM", icon: Landmark, color: "bg-[#1d4ed8]", details: "NIB: 0001 2345 6789" },
  { id: "bci", name: "BCI", icon: Landmark, color: "bg-[#059669]", details: "NIB: 0003 9876 5432" },
];

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    method: "",
    proof: null as File | null,
  });
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const lastObjectUrlRef = useRef<string | null>(null);
  const basePrice = 500;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalPrice = (basePrice * selectedPlan.multiplier).toFixed(0);
  const isStepOneValid = formData.name.trim().length > 0 && formData.phone.trim().length > 0;

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const steps = [
    { id: 1, title: "Dados", icon: User },
    { id: 2, title: "Pagamento", icon: CreditCard },
    { id: 3, title: "Upload", icon: Upload },
  ];

  const handleProofFile = (file: File | null) => {
    if (!file) return;

    const isAllowedType = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isAllowedType) {
      setError("Formato invalido. Use imagem ou PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande");
      return;
    }

    setError("");
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      lastObjectUrlRef.current = objectUrl;
      setProofPreview(objectUrl);
    } else {
      setProofPreview(null);
    }

    setFormData((prev) => ({
      ...prev,
      proof: file,
    }));
  };

  React.useEffect(
    () => () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    },
    [],
  );

  const handleSubmit = async () => {
    if (submitting) return;

    if (!formData.method) {
      setError("Selecione o mÃ©todo de pagamento");
      return;
    }

    if (!formData.proof) {
      setError("Selecione um comprovante");
      return;
    }

    if (formData.proof.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("phone", formData.phone);
      payload.append("paymentMethod", formData.method);
      payload.append("duration", String(selectedPlan.days));
      payload.append("proof", formData.proof);

      console.log("CHECKOUT PAYLOAD SENT", {
        paymentMethod: formData.method,
        duration: String(selectedPlan.days),
        hasProof: !!formData.proof,
      });

      const response = await fetch(`/api/v1/orders/${id}/checkout`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        let backendMessage = "";

        if (contentType.includes("application/json")) {
          const data = (await response.json()) as { error?: unknown; message?: unknown };
          backendMessage =
            typeof data.error === "string"
              ? data.error
              : typeof data.message === "string"
                ? data.message
                : "";
          console.log("Checkout error response", { status: response.status, data });
        } else {
          const text = await response.text();
          backendMessage = text.trim();
          console.log("Checkout error response", { status: response.status, text });
        }

        throw new Error(backendMessage || "Falha ao enviar comprovante");
      }

      setStep(4);
    } catch (submitError) {
      const message = submitError instanceof Error && submitError.message ? submitError.message : "Falha ao enviar comprovante";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center bg-surface">
        <div className="max-w-md w-full liquid-glass p-10 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">Pedido Recebido!</h1>
          <p className="font-body text-on-surface-variant">
            Seu pagamento esta sendo processado. O status atual e <span className="text-yellow-500 font-bold">PENDENTE</span>.
          </p>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm text-on-surface-variant">
            Tempo estimado de ativacao: 15-30 minutos.
          </div>
          <div className="pt-6 space-y-4">
            <Link
              href="https://wa.me/..."
              className="w-full flex items-center justify-center gap-3 py-4 bg-green-500 text-white font-headline font-bold rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </Link>
            <Link href="/" className="block font-headline text-sm text-on-surface-variant hover:text-white transition-colors">
              Voltar para a Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-12 px-6 md:px-12 bg-surface">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  step >= s.id ? "bg-primary border-primary text-on-primary" : "bg-surface border-white/10 text-on-surface-variant",
                )}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className={cn("text-[10px] font-bold tracking-widest uppercase", step >= s.id ? "text-primary" : "text-on-surface-variant")}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="liquid-glass p-8 md:p-10 rounded-3xl">
          <div key={step}>
            {step === 1 && (
              <div className="space-y-10">
                <section>
                  <h2 className="font-headline text-xl text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
                    Duracao do Plano
                  </h2>
                  <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    {plans.map((plan) => (
                      <button
                        key={plan.days}
                        onClick={() => setSelectedPlan(plan)}
                        className={cn(
                          "px-8 py-3 rounded-full border transition-all duration-300 font-headline text-xs uppercase tracking-widest",
                          selectedPlan.days === plan.days
                            ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(81,243,227,0.2)]"
                            : "liquid-glass border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/50",
                        )}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="font-body text-sm text-on-surface-variant mb-2">Total a pagar</p>
                    <div className="font-headline text-5xl text-primary font-bold tracking-tighter">
                      {totalPrice} <span className="text-xl text-primary/70 font-normal">MT</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-6 pt-10 border-t border-white/5">
                  <h2 className="font-headline text-xl text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
                    Seus Dados
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                        <input
                          type="text"
                          placeholder="Ex: Joao Matsinhe"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Telefone (WhatsApp)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                        <input
                          type="text"
                          placeholder="84 123 4567"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-headline text-2xl text-white mb-6">Pagamento</h2>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setFormData({ ...formData, method: m.id })}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                        formData.method === m.id ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5",
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", m.color)}>
                        <m.icon className="w-5 h-5" />
                      </div>
                      <span className="font-headline text-xs font-bold">{m.name}</span>
                    </button>
                  ))}
                </div>

                {formData.method && (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mt-6 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-on-surface-variant uppercase font-bold mb-2">Instrucoes de Transferencia</p>
                    <div className="flex justify-between items-center">
                      <span className="font-headline text-lg text-white tracking-widest">{paymentMethods.find((m) => m.id === formData.method)?.details}</span>
                      <button
                        onClick={() => handleCopy(paymentMethods.find((m) => m.id === formData.method)?.details || "")}
                        className="text-primary hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-4">Titular: ELBER STREAMING SERVICES</p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-headline text-2xl text-white mb-6">Enviar Comprovante</h2>
                <label
                  htmlFor="proof-upload"
                  className="block border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer group"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const file = event.dataTransfer.files?.[0] || null;
                    handleProofFile(file);
                  }}
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-on-surface-variant group-hover:text-primary" />
                  </div>
                  <p className="font-headline text-sm text-white mb-2">Clique para selecionar</p>
                  <p className="font-body text-xs text-on-surface-variant">Suporta imagem ou PDF (max 10MB)</p>
                  <input
                    id="proof-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleProofFile(file);
                    }}
                  />
                </label>

                {formData.proof ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <p className="text-sm text-white">{formData.proof.name}</p>
                    <p className="text-xs text-on-surface-variant">{(formData.proof.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : null}

                {proofPreview ? (
                  <Image
                    src={proofPreview}
                    alt="Preview do comprovante"
                    width={1200}
                    height={800}
                    className="w-full max-h-64 object-contain rounded-2xl border border-white/10 bg-black/20"
                  />
                ) : null}
              </div>
            )}

            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-4 border border-white/10 rounded-2xl font-headline font-bold text-on-surface hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              <button
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={(step === 1 && !isStepOneValid) || (step === 2 && !formData.method) || submitting}
                className={cn(
                  "flex-[2] py-4 bg-primary text-on-primary font-headline font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale",
                  step === 3 ? "bg-primary animate-pulse-cyan" : "",
                )}
              >
                {step === 3 ? "Confirmar Pedido" : "Próximo Passo"}
                {step === 3 && submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {step < 3 ? <ArrowRight className="w-4 h-4" /> : null}
              </button>
            </div>
            {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-on-surface-variant font-body">Pagamento Seguro â€¢ Suporte 24/7 â€¢ Ativacao em minutos</p>
        </div>
      </div>
    </main>
  );
}

