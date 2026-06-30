import TopbarControls from "./TopbarControls";

export default async function Topbar() {
  return (
    <header className="workspace-topbar sticky top-0 z-40 w-full border-b border-bdr bg-card px-4 py-3.5 shadow-sm sm:px-6">
      <TopbarControls />
    </header>
  );
}
