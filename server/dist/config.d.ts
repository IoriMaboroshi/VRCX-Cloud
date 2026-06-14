export declare const config: {
    readonly port: number;
    readonly host: string;
    readonly apiKey: string;
    readonly encryptionKey: string;
    readonly databasePath: string;
    readonly vrchatApiBase: string;
    readonly vrchatUserAgent: string;
    readonly pollFriendsInterval: number;
    readonly pollNotificationsInterval: number;
    readonly pollWorldsInterval: number;
    readonly pollAvatarsInterval: number;
    readonly logLevel: string;
    /** Resolved absolute path to database file. */
    readonly resolvedDatabasePath: string;
};
/** Validate required config on startup */
export declare function validateConfig(): void;
//# sourceMappingURL=config.d.ts.map