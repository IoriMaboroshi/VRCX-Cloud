export declare function setAuthCookie(c: string): void;
export declare function getAuthCookie(): string | null;
export declare function setApiKey(k: string): void;
export declare function apiRequest<T>(opts: {
    method?: string;
    path: string;
    headers?: Record<string, string>;
    body?: unknown;
    isJson?: boolean;
}): Promise<{
    status: number;
    headers: Record<string, string>;
    body: T;
}>;
export declare function get<T>(path: string, h?: Record<string, string>): Promise<{
    status: number;
    headers: Record<string, string>;
    body: T;
}>;
export declare function post<T>(path: string, b: unknown, h?: Record<string, string>): Promise<{
    status: number;
    headers: Record<string, string>;
    body: T;
}>;
export declare function put<T>(path: string, b: unknown, h?: Record<string, string>): Promise<{
    status: number;
    headers: Record<string, string>;
    body: T;
}>;
export declare function del<T>(path: string, h?: Record<string, string>): Promise<{
    status: number;
    headers: Record<string, string>;
    body: T;
}>;
//# sourceMappingURL=client.d.ts.map