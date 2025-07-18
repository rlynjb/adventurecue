import { Ingest } from "@/components/ingest";
import { Query } from "@/components/query";

export default function Home() {
  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px]">
        <h2 className="antialiased text-[3em] text-slate-500 font-semibold">
          AdventureCue
        </h2>

        <div className="query-mode">
          <Query />
        </div>

        <div className="ingest-mode">
          <Ingest />
        </div>
      </main>
    </div>
  );
}
