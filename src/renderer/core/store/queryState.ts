import { scaleLinear } from 'd3-scale';
import { atom, createStore } from 'jotai';
import React from 'react';
import { JobBatchFinished } from 'src/engineV2/engine';
import { DisplayResults, Events } from '~lib/displayTypes';
import { allData } from '~lib/qql';

export const tabNameAtom = atom<string>("New Search");
export const searchQueryAtom = atom(''); // search query

export const queryDataAtom = atom((get) => {
  const searchQuery = get(searchQueryAtom);
  return allData(searchQuery);
});


export const QuerySpecificContext = React.createContext<ReturnType<typeof createStore> | null>(null);

export const useQuerySpecificStoreInternal = () => {
  const store = React.useContext(QuerySpecificContext);
  if (!store) {
    throw new Error('useQuerySpecificStoreInternal must be used within a QuerySpecificProvider');
  }

  return store;
}

export const lastUpdateAtom = atom<Date | null>(null);

export const dataViewModelAtom = atom<DisplayResults>(
  {
    events: {
      type: "events",
      data: [],
    },
    table: undefined,
    view: undefined,
  },
);

export const jobBatchDoneAtom = atom<JobBatchFinished | undefined>(undefined);

export const eventsAtom = atom<Events>((get) => {
  return get(dataViewModelAtom).events;
})

export const availableColumnsAtom = atom((get) => {
  const results = get(jobBatchDoneAtom);
  if (!results) {
    return [];
  }

  return results.views.events.autoCompleteKeys ?? [];
});


export const scaleAtom = atom((get) => {
  const results = get(jobBatchDoneAtom);
  const selectedStartTime = results?.scale.from;
  const selectedEndTime = results?.scale.to;

  if (!selectedStartTime || !selectedEndTime) {
    return;
  }

  return scaleLinear().domain([
    selectedStartTime,
    selectedEndTime,
  ]);
});

export const dataBucketsAtom = atom((get) => {
  const results = get(jobBatchDoneAtom);
  if (!results) {
    return [];
  }

  return results.views.events.buckets;
});


export const viewSelectedForQueryAtom = atom<boolean>(false);

