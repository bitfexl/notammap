/**
 * Inject production environment dependent HTML like an analytics script into the page.
 */
export function injectHTML() {
    const inject = import.meta.env.VITE_INJECT_HEAD;
    if (inject != null && inject != "") {
        document.head.append(new DOMParser().parseFromString(inject, "text/html").body.firstChild!);
    }
}
