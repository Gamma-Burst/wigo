/**
 * Transfer Provider — Amadeus Airport Transfer Search
 */

import { amadeusPost } from "./amadeus-client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TransferOffer {
  id: string;
  transferType: string; // PRIVATE, SHARED, TAXI
  vehicle: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  cancellationType: string;
  passengers: number;
  luggage: number;
}

interface AmadeusTransferOffer {
  id: string;
  transferType: string;
  start: { dateTime: string; locationCode?: string };
  end: { dateTime: string; locationCode?: string };
  vehicle: { code: string; category: string; description: string };
  quotation: {
    monetaryAmount: string;
    currencyCode: string;
  };
  converted?: {
    monetaryAmount: string;
    currencyCode: string;
  };
  cancellationRules?: Array<{ ruleDescription: string; feeType: string }>;
  methodOfPayment?: string;
  baggage?: { count: number };
  passengerCharacteristics?: Array<{ passengerTypeCode: string; age: number }>;
}

// ─── Vehicle labels ───────────────────────────────────────────────────────────
const VEHICLE_LABELS: Record<string, string> = {
  SDN: "Berline",
  VAN: "Van",
  LMO: "Limousine",
  MBR: "Minibus",
  BUS: "Bus",
  SUV: "SUV",
  STW: "Break",
};

// ─── Search Transfers ─────────────────────────────────────────────────────────
export async function searchTransfers(params: {
  startLocationCode: string; // IATA airport code
  endAddressLine?: string;
  endGeoCode?: { latitude: number; longitude: number };
  transferDate: string; // ISO datetime
  passengers: number;
}): Promise<TransferOffer[]> {
  const body: Record<string, unknown> = {
    startLocationCode: params.startLocationCode,
    transferType: "PRIVATE",
    startDateTime: params.transferDate,
    passengers: params.passengers,
  };

  if (params.endGeoCode) {
    body.endGeoCode = `${params.endGeoCode.latitude},${params.endGeoCode.longitude}`;
  }
  if (params.endAddressLine) {
    body.endAddressLine = params.endAddressLine;
  }

  const result = await amadeusPost<AmadeusTransferOffer[]>("/v1/shopping/transfer-offers", body);

  if (!result?.data || !Array.isArray(result.data)) return [];

  return result.data.slice(0, 10).map((offer) => {
    const startTime = new Date(offer.start.dateTime);
    const endTime = new Date(offer.end.dateTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMin = Math.round(durationMs / 60000);
    const durationStr = durationMin > 60
      ? `${Math.floor(durationMin / 60)}h${(durationMin % 60).toString().padStart(2, "0")}`
      : `${durationMin} min`;

    return {
      id: offer.id,
      transferType: offer.transferType,
      vehicle: VEHICLE_LABELS[offer.vehicle.code] || offer.vehicle.description || offer.vehicle.category,
      description: offer.vehicle.description,
      price: Math.round(parseFloat(offer.quotation.monetaryAmount)),
      currency: offer.quotation.currencyCode,
      duration: durationStr,
      cancellationType: offer.cancellationRules?.[0]?.feeType || "UNKNOWN",
      passengers: params.passengers,
      luggage: offer.baggage?.count || params.passengers,
    };
  });
}
