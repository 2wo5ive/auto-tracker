// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import { supabase } from "../lib/supabase";
import "leaflet/dist/leaflet.css";

type Point = [number, number];

const DELIVERY_ID = "00000000-0000-0000-0000-000000000001";

const startPoint: Point = [43.8256, 87.6168];
const finishPoint: Point = [55.7558, 37.6173];

function getPositionByProgress(points: Point[], progress: number): Point {
  if (points.length < 2) return startPoint;

  const safeProgress = Math.max(0, Math.min(1, progress));
  const totalSegments = points.length - 1;
  const rawIndex = safeProgress * totalSegments;

  const segmentIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
  const segmentProgress = rawIndex - segmentIndex;

  const [lat1, lng1] = points[segmentIndex];
  const [lat2, lng2] = points[segmentIndex + 1];

  return [
    lat1 + (lat2 - lat1) * segmentProgress,
    lng1 + (lng2 - lng1) * segmentProgress,
  ];
}

export default function DeliveryMap() {
  const [route, setRoute] = useState<Point[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadRoute();
    loadProgress();

    const interval = setInterval(loadProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadRoute() {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${startPoint[1]},${startPoint[0]};${finishPoint[1]},${finishPoint[0]}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    const data = await res.json();

    const coords = data.routes[0].geometry.coordinates;

    const points: Point[] = coords.map(
      ([lng, lat]: [number, number]) => [lat, lng]
    );

    setRoute(points);
  }

  async function loadProgress() {
    const { data } = await supabase
      .from("deliveries")
      .select("progress")
      .eq("id", DELIVERY_ID)
      .single();

    if (data) setProgress(Number(data.progress));
  }

  const carPosition =
    route.length > 0 ? getPositionByProgress(route, progress) : startPoint;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer center={startPoint} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {route.length > 0 && <Polyline positions={route} />}
        <Marker position={carPosition} />
      </MapContainer>
    </div>
  );
}
