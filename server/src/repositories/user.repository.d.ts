export declare class UserRepository {
    findByEmail(email: string): Promise<{
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<({
        settings: {
            id: string;
            userId: string;
            theme: string;
            preferredModel: import("@prisma/client").$Enums.ModelType;
            notifications: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(data: {
        name: string;
        email: string;
        passwordHash: string;
    }): Promise<{
        settings: {
            id: string;
            userId: string;
            theme: string;
            preferredModel: import("@prisma/client").$Enums.ModelType;
            notifications: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        name: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=user.repository.d.ts.map