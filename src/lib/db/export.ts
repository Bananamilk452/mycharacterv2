import ExportWorker from "./exportDbWorker?worker";

export async function exportCollection(name: string) {
  const worker = new ExportWorker();

  worker.postMessage({ dbName: name });

  return new Promise<{ file: Blob; name: string }>((resolve) => {
    worker.onmessage = (event) => {
      resolve(event.data as { file: Blob; name: string });
    };
  });
}
