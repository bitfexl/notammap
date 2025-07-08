import { ReactNode } from "react";

export interface AppLayoutProps {
    map: ReactNode;
    header: ReactNode;
    menu: ReactNode;
    panels: ReactNode[];
}

export function AppLayout({ map, header, menu, panels }: AppLayoutProps) {
    return (
        <div className="h-[100vh] relative test-br">
            <div className="h-full w-full absolute top-0 left-0">{map}</div>
            <div className="h-full p-4">
                <div className="inline-flex flex-col h-full gap-4 test-br">
                    <div>
                        <div className="inline-block test-br relative z-[999]">{header}</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="test-br relative z-[999]">{menu}</div>
                        {panels.map((p) => (
                            <div className="test-br relative z-[999]" key={Math.random()}>
                                {p}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
