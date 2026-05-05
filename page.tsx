import { supabase } from "../../../lib/supabase";
import MapWrapper from "../../../components/MapWrapper";

const DELIVERY_ID = "00000000-0000-0000-0000-000000000001";

export default async function TrackPage() {
  const { data: delivery } = await supabase
    .from("deliveries")
    .select("*, cars(*)")
    .eq("id", DELIVERY_ID)
    .single();

  const car = delivery?.cars;

  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Трекер доставки</h1>

      {car && (
        <div style={{ marginBottom: 20 }}>
          <h2>
            {car.brand} {car.model}
          </h2>
          <p>Год: {car.year}</p>
          <p>VIN: {car.vin}</p>
          <p>Цвет: {car.color}</p>
        </div>
      )}

      <MapWrapper />
    </main>
  );
}