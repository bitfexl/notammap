import { useState } from "react";
import { DetailedNotam } from "../../api/notams/notamextractor";
import { NotamComponent } from "./NotamComponent";

export interface NotamListComponentProps {
    /**
     * The notams to display.
     */
    detailedNotams: DetailedNotam[];
}

export function NotamListComponent({ detailedNotams }: NotamListComponentProps) {
    const [notamIndex, setNotamIndex] = useState(0);

    return (
        <div className="pb-2">
            <div>
                <NotamComponent detailedNotam={detailedNotams[notamIndex]}></NotamComponent>
            </div>
            {detailedNotams.length > 1 && (
                <div className="text-center pt-6">
                    <button
                        onClick={() => setNotamIndex((notamIndex == 0 ? detailedNotams.length : notamIndex) - 1)}
                        className="w-20 linklike text-right"
                    >
                        {"Previous"}
                    </button>
                    <span className="inline-block w-16">
                        {notamIndex + 1} / {detailedNotams.length}
                    </span>
                    <button
                        onClick={() => setNotamIndex(notamIndex == detailedNotams.length - 1 ? 0 : notamIndex + 1)}
                        className="w-20 linklike text-left"
                    >
                        {"Next"}
                    </button>
                </div>
            )}
        </div>
    );
}
