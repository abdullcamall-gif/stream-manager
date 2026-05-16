export interface WhatsAppProvider {
  sendMessage(to: string, content: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(to: string, content: string) {
    console.log(`[MOCK WHATSAPP] Sending to ${to}: ${content}`);
    return {
      success: false,
      error:
        "WhatsApp provider is set to mock. Configure WHATSAPP_PROVIDER=evolution and EVOLUTION_* env vars to send real messages.",
    };
  }
}

export class EvolutionApiProvider implements WhatsAppProvider {
  private apiUrl: string;
  private apiKey: string;
  private instance: string;

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || "";
    this.apiKey = process.env.EVOLUTION_API_KEY || "";
    this.instance = process.env.EVOLUTION_INSTANCE || "";
  }

  async sendMessage(to: string, content: string) {
    if (!this.apiUrl || !this.apiKey || !this.instance) {
      return { success: false, error: "Evolution API not configured" };
    }

    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${this.instance}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: to.replace(/\D/g, ""), // Remove non-digits
          text: content,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, messageId: data.key?.id };
      }
      return { success: false, error: data.message || "Failed to send message via Evolution API" };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown provider error";
      return { success: false, error: message };
    }
  }
}

export const getWhatsAppProvider = (): WhatsAppProvider => {
  if (process.env.WHATSAPP_PROVIDER === "evolution") {
    return new EvolutionApiProvider();
  }
  return new MockWhatsAppProvider();
};
