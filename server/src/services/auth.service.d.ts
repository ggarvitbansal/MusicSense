export declare class AuthService {
    register(data: {
        name: string;
        email: string;
        passwordRaw: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        settings: {
            id: string;
            userId: string;
            theme: string;
            preferredModel: import("@prisma/client").$Enums.ModelType;
            notifications: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    login(data: {
        email: string;
        passwordRaw: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        settings: {
            id: string;
            userId: string;
            theme: string;
            preferredModel: import("@prisma/client").$Enums.ModelType;
            notifications: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map