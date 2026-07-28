import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
declare const pool: import("pg").Pool;
export declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
export { pool };
//# sourceMappingURL=db.d.ts.map