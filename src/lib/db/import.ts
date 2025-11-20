import ImportWorker from "./importDbWorker.ts?worker";

export async function importCollection(file: File) {
  const worker = new ImportWorker();

  worker.postMessage({ file });

  return new Promise<{ uuid: string }>((resolve, reject) => {
    worker.onmessage = (event: {
      data: { success: true; uuid: string } | { success: false; error: string };
    }) => {
      if (event.data.success) {
        resolve({ uuid: event.data.uuid });
      } else {
        reject(new Error(event.data.error));
      }
    };
  });
}
