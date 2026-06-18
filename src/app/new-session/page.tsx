export const dynamic = "force-dynamic";

import { PageHeader, PageShell } from "@/components/PageShell";
import { NewSessionForm } from "./NewSessionForm";
import { getAllCabins } from "@/lib/queries";

export default async function NewSessionPage() {
  const cabins = await getAllCabins();

  return (
    <PageShell variant="cinematic">
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader
          eyebrow="Staff · Rage Room"
          title="Start New Session"
          subtitle="Pick a cabin, type the camper name, then upload before & after photos"
        />
        <NewSessionForm cabins={cabins} />
      </div>
    </PageShell>
  );
}
