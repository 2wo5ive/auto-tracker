"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DELIVERY_ID = "00000000-0000-0000-0000-000000000001";

export default function AdminPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("deliveries")
      .select("progress")
      .eq("id", DELIVERY_ID)
      .single();

    if (data) setProgress(data.progress);
  }

  async function start() {
    await supabase.from("deliveries").upsert({
      id: DELIVERY_ID,
      progress: 0,
      base_progress: 0,
      speed_multiplier: 1,
      is_paused: false,
      last_resumed_at: new Date().toISOString(),
    });

    setProgress(0);
  }

  async function move() {
    const newProgress = Math.min(progress + 0.05, 1);

    await supabase
      .from("deliveries")
      .update({ progress: newProgress })
      .eq("id", DELIVERY_ID);

    setProgress(newProgress);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Админка Supabase</h1>

      <p>Progress: {Math.round(progress * 100)}%</p>

      <progress value={progress} max={1} style={{ width: 300 }} />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button onClick={start}>Старт</button>
        <button onClick={move}>Двигать +5%</button>
      </div>
    </main>
  );
}