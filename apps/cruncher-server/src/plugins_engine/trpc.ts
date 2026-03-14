import { initTRPC } from "@trpc/server";
import { Engine } from "../engineV2/engine";
import { EventEmitter } from "stream";

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const createContext = async (
  engineV2: Engine,
  eventEmitter: EventEmitter,
) => {
  return {
    engine: engineV2,
    eventEmitter: eventEmitter,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
