import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { TaskRef } from "src/engineV2/types";
import { queryClient } from "~core/client";
import { lastRanJobAtom, useInitializedController } from "~core/search";


export const invalidateJobQueries = async (jobId: TaskRef | undefined) => {
    if (!jobId) {
        return;
    }

    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: ["logs", jobId],
        }),
        queryClient.invalidateQueries({
            queryKey: ["tableData", jobId],
        }),
        queryClient.invalidateQueries({
            queryKey: ["viewData", jobId],
        }),
    ])
}

export const removeJobQueries = async (jobId: TaskRef | undefined) => {
    if (!jobId) {
        return;
    }

    queryClient.removeQueries({
        queryKey: ["logs", jobId],
    });
    queryClient.removeQueries({
        queryKey: ["tableData", jobId],
    });
    queryClient.removeQueries({
        queryKey: ["viewData", jobId],
    });
}

export const useLogsInfiniteQuery = () => {
    const controller = useInitializedController();
    const job = useAtomValue(lastRanJobAtom);

    return useInfiniteQuery({
        enabled: !!job?.id,
        queryKey: ["logs", job?.id],
        queryFn: async ({ pageParam = 0 }) => {
            return await controller.getLogsPaginated(
                job!.id,
                pageParam,
                10000 // Adjust the limit as needed
            );
        },
        getNextPageParam: (lastPage) => lastPage.next,
        getPreviousPageParam: (firstPage) => firstPage.prev,
        initialPageParam: 0,
    });
};

export const useTableDataInfiniteQuery = () => {
    const controller = useInitializedController();
    const jobInfo = useAtomValue(lastRanJobAtom);
    return useInfiniteQuery({
        enabled: !!jobInfo?.id,
        queryKey: ["tableData", jobInfo?.id],
        queryFn: async ({ pageParam = 0 }) => {
            // Replace with your actual data fetching logic
            return await controller.getTableDataPaginated(
                jobInfo!.id,
                pageParam,
                10000 // Adjust the limit as needed
            );
        },
        getNextPageParam: (lastPage) => lastPage.next,
        getPreviousPageParam: (firstPage) => firstPage.prev,
        initialPageParam: 0,
    });
}


export const useViewDataQuery = () => {
    const controller = useInitializedController();
    const jobInfo = useAtomValue(lastRanJobAtom);

    return useQuery({
        enabled: !!jobInfo?.id,
        queryKey: ["viewData", jobInfo?.id],
        queryFn: async () => {
            return await controller.getViewData(jobInfo!.id)
        },
    });
}
