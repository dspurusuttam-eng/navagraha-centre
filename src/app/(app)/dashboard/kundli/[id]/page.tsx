import { SavedKundliManager } from "@/modules/account/components/saved-kundli-manager";
import { createEmptySavedKundliCatalog } from "@/modules/account/saved-kundli";

export default async function SavedKundliDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 text-[#111111] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <SavedKundliManager
          sessionUserId="current-user"
          focusId={id}
          initialCatalog={createEmptySavedKundliCatalog()}
        />
      </div>
    </main>
  );
}
