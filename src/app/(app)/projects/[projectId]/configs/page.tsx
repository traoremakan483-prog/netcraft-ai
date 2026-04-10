import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConfigPanel } from "@/components/configs/config-panel";

type Props = { params: Promise<{ projectId: string }> };

export default async function ConfigsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const { projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!project) notFound();

  const configs = await db.config.findMany({
    where: { device: { department: { branch: { projectId } } } },
    include: {
      device: { select: { hostname: true, name: true, type: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" />
          {project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          Configurations
        </h1>
      </div>

      <ConfigPanel
        projectId={projectId}
        configs={configs.map((c) => ({
          id: c.id,
          type: c.type,
          content: c.content,
          deviceHostname: c.device.hostname ?? c.device.name,
          deviceName: c.device.name,
          deviceType: c.device.type,
        }))}
      />
    </div>
  );
}
