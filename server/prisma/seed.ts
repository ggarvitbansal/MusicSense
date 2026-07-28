import { PrismaClient, MusicalMode, ModelType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data
  await prisma.user.deleteMany({});
  console.log("Cleared existing database records.");

  // 1. Create Mock User
  const user = await prisma.user.create({
    data: {
      name: "Alex Mercer",
      email: "alex@musicsense.ai",
      passwordHash: "$2b$10$dummyhashvaluelandingpagepasswordsigninhere", // placeholder hash
    },
  });
  console.log(`Created mock user: ${user.name} (${user.email})`);

  // 2. Create User Settings
  const settings = await prisma.userSettings.create({
    data: {
      userId: user.id,
      theme: "dark",
      preferredModel: ModelType.TENSORFLOW,
      notifications: true,
    },
  });
  console.log(`Created user settings for user ID: ${settings.userId}`);

  // 3. Create Mock Music File
  const musicFile = await prisma.musicFile.create({
    data: {
      userId: user.id,
      originalName: "retro_vibe_80s.mp3",
      storedName: `${musicFileId()}-retro_vibe_80s.mp3`,
      storagePath: `uploads/${musicFileId()}-retro_vibe_80s.mp3`,
      mimeType: "audio/mpeg",
      format: "mp3",
      fileSize: 12543200, // ~12 MB
      duration: 215.4, // 3 minutes 35 seconds
    },
  });
  console.log(`Created mock music file record: ${musicFile.originalName}`);

  // 4. Create Mock Audio Analysis
  const analysis = await prisma.audioAnalysis.create({
    data: {
      musicFileId: musicFile.id,
      genre: "Synthwave",
      tempo: 110.0,
      musicalKey: "A Minor",
      mode: MusicalMode.MINOR,
      energy: 0.78,
      danceability: 0.82,
      valence: 0.65,
      analysisVersion: "1.0.0",
    },
  });
  console.log(`Created mock audio analysis for: ${musicFile.originalName} (Genre: ${analysis.genre})`);

  console.log("✅ Seeding completed successfully!");
}

// Helper to generate a dummy UUID for stored names
function musicFileId() {
  return "d3b07384-d113-41e9-b9bf-1fd528ec0931";
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
