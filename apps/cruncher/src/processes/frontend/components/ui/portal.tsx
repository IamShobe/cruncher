import { Portal as ChakraPortal } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { getPopperRoot } from "~core/utils/shadowUtils";

type PortalProps = {
  children: React.ReactNode;
};

export const Portal = ({ children }: PortalProps) => {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    containerRef.current = getPopperRoot() as HTMLElement | null;
    setReady(true);
  }, []);

  if (!ready) return null;

  return <ChakraPortal container={containerRef}>{children}</ChakraPortal>;
};
