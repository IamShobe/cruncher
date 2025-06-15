import { ScaleLinear, scaleLinear } from "d3-scale";
import { asDateField, ProcessedData } from "~lib/adapters/logTypes";


export const getScale = (selectedStartTime: Date, selectedEndTime: Date) => {
    if (!selectedStartTime || !selectedEndTime) {
        return;
    }

    return scaleLinear().domain([
        selectedStartTime.getTime(),
        selectedEndTime.getTime(),
    ]);
}


export const calculateBuckets = (scale: ScaleLinear<number, number, unknown> | undefined, data: ProcessedData[]) => {
    if (!scale) {
        return [];
    }

    const buckets: Record<number, number> = {};
    const ticks = scale.ticks(100);

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
}