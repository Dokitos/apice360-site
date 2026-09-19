"use client";

import { MapPin } from "lucide-react";
import { Map, MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";

/**
 * Sede na Rua Bento Gonçalves, Amora, Seixal — só vale quando ainda não há
 * nada nas Definições do Site. O valor que aqui estava antes apontava para
 * uma Rua Bento Gonçalves em Fernão Ferro: mesmo nome, freguesia errada, e
 * como estava no código ninguém o podia corrigir pelo painel.
 */
const FALLBACK_LOCATION = { latitude: 38.6332902, longitude: -9.1441631 };

export function ContactMap({
  className,
  latitude,
  longitude,
  label,
}: {
  className?: string;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}) {
  const point =
    latitude != null && longitude != null ? { latitude, longitude } : FALLBACK_LOCATION;
  const center: [number, number] = [point.longitude, point.latitude];

  return (
    <div className={className}>
      <Map theme="light" viewport={{ center, zoom: 15, bearing: 0, pitch: 0 }} scrollZoom={false}>
        <MapMarker longitude={point.longitude} latitude={point.latitude}>
          <MarkerContent>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(255,106,19,0.5)]">
              <MapPin className="h-5 w-5" fill="currentColor" stroke="white" strokeWidth={1.5} />
            </div>
          </MarkerContent>
          <MarkerTooltip>{label || "Ápice 360"}</MarkerTooltip>
        </MapMarker>
      </Map>
    </div>
  );
}
