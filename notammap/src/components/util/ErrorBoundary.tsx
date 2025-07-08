// https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

import * as React from "react";

export interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export class ErrorBoundary extends React.Component {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
        console.error(error + info.componentStack);
    }

    render() {
        if ((this.state as any).hasError) {
            return <Error></Error>;
        }
        return (this.props as any).children;
    }
}

function Error() {
    return (
        <div className="inline-flex flex-col gap-4 m-4 w-96">
            <h2>Error rendering Notam Map UI</h2>
            <p className="text-justify">
                You can try clearing the website's data and cache. Click the button below to clear the data and reset the Notam Map. The
                cache has to be cleared manually.
            </p>
            <button onClick={clearWebsiteData}>Clear Data</button>
        </div>
    );
}

function clearWebsiteData() {
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
}
