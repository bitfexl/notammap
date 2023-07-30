import { Notam } from "../notams/notamextractor";
import { NotamComponent } from "./NotamComponent";

export interface NotamListComponentProps {
    /**
     * The notams to display.
     */
    notams: Notam[];
}

export function NotamListComponent({ notams }: NotamListComponentProps) {
    return (
        <div>
            {notams.map((notam, i) => (
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
