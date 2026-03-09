import React, { useCallback } from "react";
import { useEvent } from "react-use";
import { getCruncherRoot } from "~core/utils/shadowUtils";

export function useOutsideDetector(onOutsideClick = () => {}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const root = getCruncherRoot();

  if (!root) {
    console.warn("Root not found - useOutsideDetector will not work");
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        ref.current &&
        event.target &&
        !ref.current.contains(event.target as Node)
      ) {
        onOutsideClick();
      }
    },
    [onOutsideClick],
  );

  useEvent("mousedown", root ? handleClickOutside : null, root ?? undefined);

  return ref;
}
