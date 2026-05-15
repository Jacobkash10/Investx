export default function Loading() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-32">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-6 py-4 backdrop-blur-xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />

          <p className="text-sm font-bold text-emerald-300">
            Recherche...
          </p>
        </div>
      </div>
    </main>
  );
}