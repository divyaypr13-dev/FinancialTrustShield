import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { CityBreakdown } from "@/lib/api";
import { CITY_COORDS } from "@/lib/city-coords";


export interface RiskMapFilters {
  high: boolean;
  suspicious: boolean;
  safe: boolean;
}

function dominant(r: CityBreakdown, f: RiskMapFilters) {
  const high = f.high ? r.high_risk : 0;
  const sus = f.suspicious ? r.suspicious : 0;
  const safe = f.safe ? r.safe : 0;
  const total = high + sus + safe;
  const color =
    high >= sus && high >= safe && high > 0
      ? "var(--danger)"
      : sus >= safe && sus > 0
        ? "var(--warn)"
        : "var(--safe)";
  return { total, color, high, sus, safe };
}

export default function IndiaRiskMap({
  rows,
  filters,
}: {
  rows: CityBreakdown[];
  filters: RiskMapFilters;
}) {
  const points = useMemo(
    () =>
      rows
        .map((r) => ({ row: r, coords: CITY_COORDS[r.city] }))
        .filter((p): p is { row: CityBreakdown; coords: { lat: number; lng: number } } =>
          Boolean(p.coords),
        )
        .map((p) => ({ ...p, ...dominant(p.row, filters) }))
        .filter((p) => p.total > 0),
    [rows, filters],
  );

  const max = Math.max(1, ...points.map((p) => p.total));

  return (
    <div className="h-[460px] w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={[22.5, 79]}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <CircleMarker
            key={p.row.city}
            center={[p.coords.lat, p.coords.lng]}
            radius={6 + (p.total / max) * 16}
            pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.55, weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <strong>{p.row.city}</strong> — {p.total} cases
            </Tooltip>
            <Popup>
              <div className="text-xs">
                <p className="text-sm font-semibold">{p.row.city}</p>
                <p>High risk: {p.row.high_risk}</p>
                <p>Suspicious: {p.row.suspicious}</p>
                <p>Safe: {p.row.safe}</p>
                <p className="font-medium">
                  Total: {p.row.high_risk + p.row.suspicious + p.row.safe}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
