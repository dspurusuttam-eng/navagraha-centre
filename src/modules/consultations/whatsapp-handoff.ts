export type SelectedConsultationMessageInput = {
  concern: string;
  priceLabel: string;
  tierName: string;
  utilityName: string;
  modeName?: string | null;
};

export type GeneralEnquiryMessageInput = {
  concern: string;
};

export function consultationDisplayName(input: Pick<SelectedConsultationMessageInput, "modeName" | "utilityName">) {
  return input.modeName ? `${input.utilityName} — ${input.modeName}` : input.utilityName;
}

export function buildSelectedConsultationMessage(input: SelectedConsultationMessageInput) {
  return `Namaste. I would like to begin a consultation with NAVAGRAHA CENTRE.

Selected Consultation: ${consultationDisplayName(input)}
Tier: ${input.tierName}
Launch Price: ${input.priceLabel}

Preferred Language: ENGLISH

My Main Concern:
${input.concern.trim()}

I understand that this is a one-time case fee for one selected concern and is not billed per minute.

Please confirm the required details, payment process and next step.`;
}

export function buildGeneralEnquiryMessage(input: GeneralEnquiryMessageInput) {
  return `Namaste. I would like help selecting the right consultation with NAVAGRAHA CENTRE.

Preferred Language: ENGLISH

My Main Concern:
${input.concern.trim()}

I understand that consultation uses a one-time case fee and is not billed per minute.

Please guide me to the appropriate consultation and next step.`;
}

export function buildWhatsappHandoffUrl(whatsappBaseUrl: string | null, message: string) {
  if (!whatsappBaseUrl) {
    return null;
  }

  try {
    const url = new URL(whatsappBaseUrl);
    if (url.protocol !== "https:" || url.hostname !== "wa.me") {
      return null;
    }
    if (!/^\/[1-9]\d{7,14}$/.test(url.pathname)) {
      return null;
    }
    url.search = "";
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return null;
  }
}
