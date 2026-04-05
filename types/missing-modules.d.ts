// Comprehensive type declarations for all missing modules
declare module '*';

// Specific commonly used modules
declare module 'aws-lambda' {
  export interface Handler<TEvent = any, TResult = any> {
    (event: TEvent, context: any, callback: (error?: any, result?: TResult) => void): Promise<TResult> | void;
  }
}

declare module 'body-parser' {
  function json(options?: any): any;
  function urlencoded(options?: any): any;
  function text(options?: any): any;
  function raw(options?: any): any;
}

declare module 'bunyan' {
  export class Logger {
    info(msg: any, ...params: any[]): void;
    warn(msg: any, ...params: any[]): void;
    error(msg: any, ...params: any[]): void;
    debug(msg: any, ...params: any[]): void;
  }
  export function createLogger(options: any): Logger;
}

declare module 'cors' {
  function cors(options?: any): any;
  export = cors;
}

declare module 'express' {
  interface Request {
    [key: string]: any;
  }
  interface Response {
    [key: string]: any;
  }
}

declare module 'jsonwebtoken' {
  function sign(payload: any, secret: string, options?: any): string;
  function verify(token: string, secret: string): any;
  function decode(token: string): any;
}

declare module 'mysql' {
  export function createConnection(options: any): any;
  export function createPool(options: any): any;
}

declare module 'pg' {
  export class Pool {
    query(text: string, params?: any[]): Promise<any>;
    connect(): Promise<any>;
    end(): Promise<void>;
  }
  export class Client {
    query(text: string, params?: any[]): Promise<any>;
    connect(): Promise<void>;
    end(): Promise<void>;
  }
}

declare module 'sharp' {
  function sharp(input?: any): any;
  export = sharp;
}

declare module 'node-fetch' {
  function fetch(url: string, options?: any): Promise<any>;
  export = fetch;
}

declare module 'mime' {
  function getType(path: string): string | null;
  function getExtension(mime: string): string | null;
}

declare module 'ms' {
  function ms(str: string): number;
  function fmt(num: number): string;
}

// Generic catch-all for any other missing modules
declare module 'aws-lambda*';
declare module 'body-parser*';
declare module 'bunyan*';
declare module 'caseless*';
declare module 'connect*';
declare module 'cors*';
declare module 'd3-*';
declare module 'draco3d*';
declare module 'express*';
declare module 'express-serve-static-core*';
declare module 'http-errors*';
declare module 'json-schema*';
declare module 'jsonwebtoken*';
declare module 'memcached*';
declare module 'mime*';
declare module 'ms*';
declare module 'mysql*';
declare module 'offscreencanvas*';
declare module 'qs*';
declare module 'send*';
declare module 'serve-static*';
declare module 'type-is*';
declare module 'vary*';
declare module 'pg*';
declare module 'postgres-*';
declare module 'node-*';
declare module 'sharp*';
