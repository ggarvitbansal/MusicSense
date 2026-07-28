import { userRepository } from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/password.helper.js";
import { generateToken } from "../utils/jwt.helper.js";
export class AuthService {
    async register(data) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Email already registered");
        }
        const passwordHash = await hashPassword(data.passwordRaw);
        const user = await userRepository.create({
            name: data.name,
            email: data.email,
            passwordHash,
        });
        // Exclude passwordHash from returned user object
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async login(data) {
        const user = await userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await comparePassword(data.passwordRaw, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        const token = generateToken({ userId: user.id, email: user.email });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            token,
            user: userWithoutPassword,
        };
    }
    async getCurrentUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map