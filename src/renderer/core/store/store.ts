import { atom, createStore } from 'jotai'
import { searchQueryAtom } from './queryState';
import { endFullDateAtom, startFullDateAtom } from './dateState';
import { FullDate } from '~lib/dateUtils';

export type QueryState = {
    searchQuery: string;
    startTime: FullDate | undefined;
    endTime: FullDate | undefined;
}

export const queryStateAtom = atom<QueryState>((get) => {
    const searchQuery = get(searchQueryAtom);
    const startTime = get(startFullDateAtom);
    const endTime = get(endFullDateAtom);

    return {
        searchQuery,
        startTime,
        endTime,
    };
});

export const store: ReturnType<typeof createStore> = createStore();

export const subscribeToQueryState = (callback: (state: QueryState) => void) => {
    const unsubscribe = store.sub(queryStateAtom, () => {
        const state = store.get(queryStateAtom);
        callback({
            searchQuery: state.searchQuery,
            startTime: state.startTime,
            endTime: state.endTime,
        });
    });
    return () => {
        unsubscribe();
    };
}
