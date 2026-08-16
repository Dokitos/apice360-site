"use client";

import { MapPin } from "lucide-react";
import { Map, MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";

// Rua Bento Gonçalves, 62, Seixal, Portugal
const COMPANY_LOCATION: [number, number] = [-9.0900308, 38.5612816];

export function ContactMap({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Map
        theme="light"
        viewport={{ center: COMPANY_LOCATION, zoom: 15, bearing: 0, pitch: 0 }}
        scrollZoom={false}
      >
        <MapMarker longitude={COMPANY_LOCATION[0]} latitude={COMPANY_LOCATION[1]}>
          <MarkerContent>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_16px_rgba(255,106,19,0.5)]">
              <MapPin className="h-5 w-5" fill="currentColor" stroke="white" strokeWidth={1.5} />
            </div>
          </MarkerContent>
          <MarkerTooltip>Ápice 360 — Rua Bento Gonçalves, 62, Seixal</MarkerTooltip>
        </MapMarker>
      </Map>
    </div>
  );
}
