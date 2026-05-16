type DeliveryInput = {
  serviceName: string;
  accountEmail: string;
  accountPassword: string;
  profileName: string;
  expiresAt: Date | string;
};

export function generateWhatsAppDeliveryMessage(input: DeliveryInput): string {
  const expiresAt = input.expiresAt instanceof Date ? input.expiresAt : new Date(input.expiresAt);
  const expiresDate = Number.isNaN(expiresAt.getTime()) ? String(input.expiresAt) : expiresAt.toLocaleDateString("pt-MZ");

  return [
    `Seu acesso a ${input.serviceName} foi aprovado.`,
    `Email: ${input.accountEmail}`,
    `Senha: ${input.accountPassword}`,
    `Perfil: ${input.profileName}`,
    `Validade: ${expiresDate}`,
    "Bom proveito.",
  ].join("\n");
}
