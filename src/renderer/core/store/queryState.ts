import { scaleLinear } from 'd3-scale';
import { atom } from 'jotai';
import { DisplayResults, Events } from '~lib/displayTypes';
import { asDateField, ProcessedData } from '~lib/adapters/logTypes';
import { allData } from '~lib/qql';
import { actualEndTimeAtom, actualStartTimeAtom } from './dateState';

export const availableControllerParamsAtom = atom<Record<string, string[]>>({});
export const searchQueryAtom = atom(''); // search query

export const queryDataAtom = atom((get) => {
  const searchQuery = get(searchQueryAtom);
  return allData(searchQuery);
});

export const originalDataAtom = atom<ProcessedData[]>([]);
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

export const eventsAtom = atom<Events>((get) => {
  return get(dataViewModelAtom).events;
})

export const availableColumnsAtom = atom((get) => {
  const events = get(eventsAtom);
  const data = events.data;
  if (!data.length) {
    return [];
  }

  const columns = new Set<string>();
  data.forEach((dataPoint) => {
    for (const key in dataPoint.object) {
      columns.add(key);
    }
  });

  return Array.from(columns);
});


export const scaleAtom = atom((get) => {
  const selectedStartTime = get(actualStartTimeAtom);
  const selectedEndTime = get(actualEndTimeAtom);

  if (!selectedStartTime || !selectedEndTime) {
    return;
  }

  return scaleLinear().domain([
    selectedStartTime.getTime(),
    selectedEndTime.getTime(),
  ]);
});

export const dataBucketsAtom = atom((get) => {
  const scale = get(scaleAtom);
  if (!scale) {
    return [];
  }


  const buckets: Record<number, number> = {};
  const ticks = scale.ticks(100);

  const data = get(eventsAtom).data;

  data.forEach((object) => {
    // round timestamp to the nearest tick
    const timestamp = ticks.reduce((prev, curr) => {
      const thisTimestamp = asDateField(object.object._time).value;

      return Math.abs(curr - thisTimestamp) < Math.abs(prev - thisTimestamp)
        ? curr
        : prev;
    });
    if (!buckets[timestamp]) {
      buckets[timestamp] = 0;
    }

    buckets[timestamp] += 1;
  });

  return Object.entries(buckets).map(([timestamp, count]) => ({
    timestamp: parseInt(timestamp),
    count,
  }));
});


export const viewSelectedForQueryAtom = atom<boolean>(false);
