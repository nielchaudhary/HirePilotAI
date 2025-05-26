declare global {
  interface ReadableStream<R = any> {
    getReader(): ReadableStreamDefaultReader<R>;
  }

  interface ReadableStreamDefaultReader<R = any> {
    read(): Promise<{ done: boolean; value: R | undefined }>;
    cancel(): void;
  }
}

export type FetchResponse = globalThis.Response;
