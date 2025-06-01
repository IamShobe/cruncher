

export const getCruncherRoot = () => {
    const root = document.getElementById('cruncher-root');
    if (!root) {
        return undefined;
    }

    const shadowRoot = root?.shadowRoot;
    if (!shadowRoot) {
        return undefined;
    }

    const result = shadowRoot.getElementById('cruncher-inner-root');
    return result;
}

export const getPopperRoot = () => {
    const root = getCruncherRoot();
    if (!root) {
        return undefined;
    }

    const result = root.querySelector('#cruncher-popovers');
    return result;
}