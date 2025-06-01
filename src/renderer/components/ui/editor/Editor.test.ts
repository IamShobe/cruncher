import { expect, test } from "vitest";
import { splitTextToChunks } from "./Highlighter";


test("split string to highlight chunks", () => {
    const result = splitTextToChunks("hello world", [
        {
            type: "keyword",
            token: {
                startOffset: 0,
                endOffset: 5,
            },
        }
    ])

    expect(result).toEqual([
        {type: "keyword", value: "hello"},
        " world",
    ]);
});