export declare class PushEngine {
    handleEvent(uid: string, etype: string, data: {
        displayName: string;
        location?: string;
        status?: string;
    }): Promise<void>;
}
export declare const pushEngine: PushEngine;
//# sourceMappingURL=pushEngine.d.ts.map