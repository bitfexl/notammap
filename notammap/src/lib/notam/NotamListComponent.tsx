import { Notam } from "../notams/notamextractor";
import { NotamComponent } from "./NotamComponent";

export interface NotamListComponentProps {
    /**
     * The notams to display.
     */
    notams: Notam[];
}

export function NotamListComponent({ notams }: NotamListComponentProps) {
    const addedNotams: string[] = [];
    const filteredNotams = notams.filter((notam) => {
        if (addedNotams.includes(notam.series)) {
            addedNotams.push(notam.series);
            return true;
        }
        return false;
    });

    return (
        <div>
            {filteredNotams.map((notam, i) => (
                <div key={notam.series}>
                    {i != 0 && (
                        <div className="p-6">
                            <hr />
                        </div>
                    )}
                    <div>
                        <NotamComponent notam={notam}></NotamComponent>
                    </div>
                </div>
            ))}
        </div>
    );
}
