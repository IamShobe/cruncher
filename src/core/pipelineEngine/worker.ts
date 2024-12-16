

// worker instance
export const workerInstance = new ComlinkWorker<typeof import("../sw/pipelineWorker")>(
    new URL("../sw/pipelineWorker", import.meta.url)
);
