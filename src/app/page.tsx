import { BackgroundGrid } from "@/components/effects/BackgroundGrid";
import { CubeSceneLoader } from "@/components/cube/CubeSceneLoader";
import { Header } from "@/components/interface/Header";
import { Footer } from "@/components/interface/Footer";
import { profile } from "@/data/profile";

export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg">
      <h1 className="sr-only">
        {profile.name} — {profile.role}
      </h1>
      <BackgroundGrid />
      <CubeSceneLoader />
      <Header />
      <Footer />
    </main>
  );
}
