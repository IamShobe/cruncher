import React, { useEffect } from "react";
import { getCruncherRoot } from "~core/shadowUtils";

export function useOutsideDetector(onOutsideClick = () => { }) {
    const ref = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        const root = getCruncherRoot();
        if (!root) {
            console.warn("Root not found - useOutsideDetector will not work");
            return;
        }

        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && event.target && !ref.current.contains(event.target as Node)) {
                onOutsideClick();
            }
        }
        // Bind the event listener
        root.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            root.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onOutsideClick]);

    return ref;
}
