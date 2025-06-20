import { createFileRoute } from "@tanstack/react-router";
import { SearcherWrapper } from "~features/searcher/SearcherWrapper";

export const Route = createFileRoute("/")({
  component: SearcherWrapper,
});
