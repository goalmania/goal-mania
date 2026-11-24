import { permanentRedirect } from "next/navigation";
import { getArchiveItems, groupItems } from "@/lib/archiveData";

export const revalidate = 300;

// Le vecchie pagine retro per squadra ora vivono in /archivio: stessa squadra, stesso indirizzo logico, redirect permanente
export default async function RetroTeamRedirect({ params }: { params: Promise<{ team: string }> }) {
  const { team } = await params;
  const slug = `squadra-${team.toLowerCase()}`;
  const items = await getArchiveItems();
  permanentRedirect(groupItems(items, slug) ? `/archivio/${slug}` : "/archivio");
}
