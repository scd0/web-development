/// <reference types="vite/client" />

declare var stopped: boolean = false 

declare module '*.png' {
  const value: string;
  export = value;
}
