import { scaleLinear } from "d3-scale";
import { atom, createStore } from "jotai";
import React from "react";
import { JobBatchFinished } from "@cruncher/server-shared";
import { allData } from "@cruncher/qql";

export const tabNameAtom = atom<string>("New Search");
export const searchQueryAtom = atom(""); // search query

export const queryDataAtom = atom((get) => {
  const searchQuery = get(searchQueryAtom);
  return allData(searchQuery);
});

export const QuerySpecificContext = React.createContext<ReturnType<
  typeof createStore
> | null>(null);

export const useQuerySpecificStoreInternal = () => {
  const store = React.useContext(QuerySpecificContext);
  if (!store) {
    throw new Error(
      "useQuerySpecificStoreInternal must be used within a QuerySpecificProvider",
    );
  }

  return store;
};

export const jobMetadataAtom = atom<JobBatchFinished | undefined>(undefined);

export const availableColumnsAtom = atom((get) => {
  const results = get(jobMetadataAtom);
  if (!results) {
    return [];
  }

  return results.views.events.autoCompleteKeys ?? [];
});

export const scaleAtom = atom((get) => {
  const results = get(jobMetadataAtom);
  const selectedStartTime = results?.scale.from;
  const selectedEndTime = results?.scale.to;

  if (!selectedStartTime || !selectedEndTime) {
    return;
  }

  return scaleLinear().domain([selectedStartTime, selectedEndTime]);
});

export const dataBucketsAtom = atom((get) => {
  const results = get(jobMetadataAtom);
  if (!results) {
    return [];
  }

  return results.views.events.buckets;
});

export const viewSelectedForQueryAtom = atom<boolean>(false);

export const isLiveModeAtom = atom(false);
export const isLiveFetchingAtom = atom(false); // true while a live fetch is in-flight
export const lastLiveRefreshTimeAtom = atom<Date | null>(null);
export const newLogSinceAtom = atom<number | null>(null); // ms timestamp for row highlight animation
