import BTree from "sorted-btree";
import { ProcessedData } from "~lib/adapters/logTypes";

export const tree = new BTree<number, ProcessedData[]>(undefined, (a, b) => b - a);
