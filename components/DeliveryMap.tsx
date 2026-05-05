"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Point = [number, number];

const startPoint: Point = [43.8256, 87.6168];
const finishPoint: Point = [55.7558, 37.6173];

function getPositionByProgress(points: Point[], progress: number): Point {
  if (points.length === 0) return startPoint;
  if (points.length === 1) return points[0];

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
  const [roadRoute, setRoadRoute] = useState<Point[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadRoute() {
      const [startLat, startLng] = startPoint;
      const [finishLat, finishLng] = finishPoint;

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLng},${startLat};${finishLng},${finishLat}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      const coordinates = data.routes[0].geometry.coordinates;

      const route: Point[] = coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      setRoadRoute(route);
    }

    loadRoute();
  }, []);

  useEffect(() => {
    if (roadRoute.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.001;
        if (next >= 1) return 1;
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [roadRoute]);

  const carPosition =
    roadRoute.length > 0
      ? getPositionByProgress(roadRoute, progress)
      : startPoint;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={startPoint}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {roadRoute.length > 0 && <Polyline positions={roadRoute} />}

        <Marker position={carPosition} />
      </MapContainer>
    </div>
  );
}