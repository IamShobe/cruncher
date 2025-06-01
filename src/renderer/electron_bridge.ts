import type { QueryTask } from "src/plugins_engine/types";
import { QueryProvider } from "~core/common/interface";

const jobs: QueryTask[] = [];

export const electronBridge: QueryProvider = {
    getControllerParams: async () => {
        // This function should return the controller parameters
        // For now, we return an empty object
        const instances = await window.electronAPI.plugins.getInitializedPlugins();
        const instanceId = instances[0].id;
        
        const params = await window.electronAPI.query.controllerParams(instanceId);
        console.log("Controller parameters:", params);
        return params;
    },

    query: async (params, searchTerm, queryOptions) => {
        // This function should perform the query based on the provided parameters and search term
        // For now, we just log the parameters and search term
        console.log("Querying with params:", params);
        console.log("Search term:", searchTerm);

        const instances = await window.electronAPI.plugins.getInitializedPlugins();
        const instanceId = instances[0].id;

        const job = await window.electronAPI.query.run(instanceId,
            params,
            searchTerm,
            {
                fromTime: queryOptions.fromTime,
                toTime: queryOptions.toTime,
                limit: queryOptions.limit,
            });
        jobs.push(job);
        console.log("Query job started:", job);
        // Call the onBatchDone callback with an empty array as a placeholder for processed data
        window.electronAPI.query.onBatchDone(job.id, (jobId, data) => {
            console.log(`Batch done for job ${jobId}`);
            queryOptions.onBatchDone(data);
        });

        // setup cancel token
        const cancelToken = queryOptions.cancelToken;
        cancelToken.addEventListener('abort', () => {
            console.log(`Query job ${job.id} cancelled`);
            // Here we can handle the cancellation logic if needed
            window.electronAPI.query.cancel(job.id);
        });

        return new Promise((resolve, reject) => {
            window.electronAPI.query.onJobUpdated(job.id, (job) => {
                console.log("Job updated:", job);
                if (job.status === "completed") {
                    resolve();
                } else {
                    reject(new Error(`Query failed for job ${job.id}`));
                }
            });
        }
        );
    }
}