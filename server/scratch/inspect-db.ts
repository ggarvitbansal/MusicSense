import { prisma } from "../src/db.js";

async function main() {
  console.log("--- Inspecting Live Database ---");
  const audioFiles = await prisma.audioFile.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });

  console.log("Last 10 AudioFiles:");
  for (const f of audioFiles) {
    console.log({
      id: f.id,
      originalName: f.originalName,
      status: f.status,
      path: f.path,
      createdAt: f.createdAt
    });
  }

  const analyses = await prisma.analysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });
  console.log("\nLast 5 Analyses:");
  console.log(analyses.map(a => ({
    id: a.id,
    audioFileId: a.audioFileId,
    filename: a.filename,
    createdAt: a.createdAt
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
