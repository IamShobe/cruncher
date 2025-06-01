

type KeyTypes = "Meta" | "Shift" | "Alt" | "Control";

type PlatformTypes = "Mac" | "Windows";

type ShortcutAliases = Record<PlatformTypes, Record<KeyTypes, string>>;

type ShortcutDefinitions = Record<string, Record<PlatformTypes, string>>;

const keyMapsAliases: ShortcutAliases = {
    "Mac": {
        "Meta": "⌘",
        "Shift": "⇧",
        "Alt": "⌥",
        "Control": "⌃",
    },
    "Windows": {
        "Meta": "Win",
        "Shift": "Shift",
        "Alt": "Alt",
        "Control": "Ctrl",
    },
};


class ShortcutHolder<T extends ShortcutDefinitions> {
    constructor(private shortcuts: T) { }

    getShortcuts() {
        return this.shortcuts;
    }

    private getShortcutKeys(shortcut: keyof T) {
        const platform = getUserPlatform();
        return this.shortcuts[shortcut][platform].split(" + ");
    }
    isPressed(event: React.KeyboardEvent | KeyboardEvent, shortcut: keyof T) {
        const keys = this.getShortcutKeys(shortcut);
        if (!keys) {
            return false;
        }

        return keys.every((key) => {
            switch (key) {
                case "Meta":
                    return event.metaKey;
                case "Shift":
                    return event.shiftKey;
                case "Alt":
                    return event.altKey;
                case "Control":
                    return event.ctrlKey;
                case "Enter":
                    return event.code === "Enter";

                default:
                    return event.code === `Key${key}`;
            }
        });
    }
    getAlias(shortcut: keyof T) {
        const platform = getUserPlatform();
        const keys = this.shortcuts[shortcut][platform].split(" + ");
        return keys.map((key) => {
            const platformKeys = keyMapsAliases[platform];
            return platformKeys?.[key as KeyTypes] ?? key;
        });
    }
}


const getUserPlatform = (): PlatformTypes => {
    return navigator.userAgent.includes("Macintosh") ? "Mac" : "Windows";
}


export const headerShortcuts = new ShortcutHolder({
    "search": {
        "Mac": "Meta + Shift + Enter",
        "Windows": "Control + Shift + Enter",
    },
    "re-evaluate": {
        "Mac": "Shift + Enter",
        "Windows": "Shift + Enter",
    },
});

export const globalShortcuts = new ShortcutHolder({
    "select-time": {
        "Mac": "Alt + T",
        "Windows": "Alt + T",
    },
    "query": {
        "Mac": "Alt + Q",
        "Windows": "Alt + Q",
    },
});
