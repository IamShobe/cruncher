import { Progress as ChakraProgress } from "@chakra-ui/react";
import * as React from "react";

export const ProgressBar = React.forwardRef<
  HTMLDivElement,
  ChakraProgress.TrackProps
>(function ProgressBar(props, ref) {
  return (
    // @ts-expect-error - lib component
    <ChakraProgress.Track {...props} ref={ref}>
      <ChakraProgress.Range />
    </ChakraProgress.Track>
  );
});

export const ProgressRoot = ChakraProgress.Root;
