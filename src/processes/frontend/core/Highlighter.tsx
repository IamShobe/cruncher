import { Input, InputGroup } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { LuHighlighter } from "react-icons/lu";
import { highlightItemQueryAtom } from "./search";

export type HighlighterRef = {
  focus: () => void;
  blur: () => void;
};

export const Highlighter = forwardRef<HighlighterRef>((props, ref) => {
  const [highlightItemQuery, setHighlightItemQuery] = useAtom(
    highlightItemQueryAtom,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    blur: blurInput,
  }));

  const blurInput = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <InputGroup flex="1" startElement={<LuHighlighter />}>
      <Input
        ref={inputRef}
        size="2xs"
        variant="outline"
        placeholder="Highlight"
        value={highlightItemQuery}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setHighlightItemQuery("");
            blurInput();
          } else if (e.key === "Enter") {
            blurInput();
          }
        }}
        onChange={(e) => setHighlightItemQuery(e.target.value)}
      />
    </InputGroup>
  );
});
