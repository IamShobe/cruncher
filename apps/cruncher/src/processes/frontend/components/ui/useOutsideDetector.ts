import React, { useCallback, useEffect } from "react";
import { getCruncherRoot } from "~core/utils/shadowUtils";

export function useOutsideDetector(onOutsideClick = () => {}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onOutsideClickRef = React.useRef(onOutsideClick);
  onOutsideClickRef.current = onOutsideClick;

  const handleMouseDown = useCallback((event: Event) => {
    if (
      ref.current &&
      event.target instanceof Node &&
      !ref.current.contains(event.target)
    ) {
      onOutsideClickRef.current();
    }
  }, []);

  useEffect(() => {
    const shadowRoot = getCruncherRoot()?.getRootNode() as ShadowRoot | null;
    if (!shadowRoot) {
      console.warn("Shadow root not found - useOutsideDetector will not work");
      return;
    }
    shadowRoot.addEventListener("mousedown", handleMouseDown, true);
    return () =>
      shadowRoot.removeEventListener("mousedown", handleMouseDown, true);
  }, [handleMouseDown]);

  return ref;
}
