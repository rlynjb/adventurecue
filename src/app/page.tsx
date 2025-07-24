import { Ingest } from "@/components/ingest";
import { Query } from "@/components/query";

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-container__header">
        <h2 className="antialiased text-[2em] text-slate-500 font-semibold">
          advntrQ
        </h2>
      </header>

      <Query />

      <div className="ingest-mode invisible">
        <Ingest />
      </div>
    </div>
  );
}
