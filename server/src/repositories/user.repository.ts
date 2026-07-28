import { prisma } from "../db.js";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });
  }

  async create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        settings: {
          create: {}, // Creates default UserSettings
        },
      },
      include: {
        settings: true,
      },
    });
  }
}

export const userRepository = new UserRepository();
