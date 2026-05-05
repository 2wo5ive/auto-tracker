import MapWrapper from "../components/MapWrapper";

export default function Home() {
  return (
    <main style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Трекер доставки автомобиля</h1>
      <p>Главная страница</p>

      <MapWrapper />
    </main>
  );
}
