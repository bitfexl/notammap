import { useState } from "react";
import { Notam } from "../notams/notamextractor";
import { NotamComponent } from "./NotamComponent";

export interface NotamListComponentProps {
    /**
     * The notams to display.
     */
    notams: Notam[];
}

export function NotamListComponent({ notams }: NotamListComponentProps) {
    const [notamIndex, setNotamIndex] = useState(0);

    const addedNotams: string[] = [];
    const filteredNotams = notams.filter((notam) => {
        if (!addedNotams.includes(notam.series)) {
            addedNotams.push(notam.series);
            return true;
        }
        return false;
    });

    return (
        <div className="pb-2">
            <div>
                <NotamComponent notam={filteredNotams[notamIndex]}></NotamComponent>
            </div>
            {filteredNotams.length > 1 && (
                <div className="text-center pt-6">
                    <button
                        onClick={() => setNotamIndex((notamIndex == 0 ? filteredNotams.length : notamIndex) - 1)}
                        className="w-20 linklike text-right"
                    >
                        {"Previous"}
                    </button>
                    <span className="inline-block w-16">
                        {notamIndex + 1} / {filteredNotams.length}
                    </span>
                    <button
                        onClick={() => setNotamIndex(notamIndex == filteredNotams.length - 1 ? 0 : notamIndex + 1)}
                        className="w-20 linklike text-left"
                    >
                        {"Next"}
                    </button>
                </div>
            )}
        </div>
    );
}
