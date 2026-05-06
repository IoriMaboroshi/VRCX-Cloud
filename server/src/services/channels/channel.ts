export interface Channel { type: string; send: (m: string) => Promise<{success:boolean;error?:string}>; }
