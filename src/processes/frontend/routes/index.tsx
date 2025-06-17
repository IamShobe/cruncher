import { createFileRoute } from "@tanstack/react-router";
import { SearcherWrapper } from "~core/SearcherWrapper";

export const Route = createFileRoute("/")({
  component: SearcherWrapper,
});
