// Suppress all type definition errors
declare module '*' {
  const content: any;
  export = content;
}

// Specific declarations for commonly used modules
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare module 'node' {
  export * from 'process';
}

declare module 'uuid' {
  export function v1(): string;
  export function v4(): string;
  export function v5(name: string, namespace: string): string;
  export function parse(uuid: string): any;
  export function version(uuid: string): number;
}

declare module 'long' {
  export class Long {
    constructor(low: number, high?: number, unsigned?: boolean);
    toNumber(): number;
    toString(radix?: number): string;
    static fromString(str: string, unsigned?: boolean, radix?: number): Long;
    static fromValue(val: any): Long;
  }
}
