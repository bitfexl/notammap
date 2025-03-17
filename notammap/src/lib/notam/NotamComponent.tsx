import { toText } from "../notams/QCodes";
import { Notam } from "../notams/notamextractor";
import { useState } from "react";

export interface NotamComponentProps {
    /**
     * The notam to display.
     */
    notam: Notam;
}

export function NotamComponent({ notam }: NotamComponentProps) {
    const [showRaw, setShowRaw] = useState(false);

    if (showRaw) {
        return (
            <div>
                <div className="text-right">
                    <button
                        className="linklike pr-2"
                        onClick={(e) => {
                            setShowRaw(false);
                            e.stopPropagation();
                        }}
                    >
                        Show Formatted
                    </button>
                </div>
                <pre>{notam.raw}</pre>
            </div>
        );
    }

    const notamId = notam.series + "/" + (notam.year - 2000);
    const notamIdText = <span className="font-mono text-sm">{notamId}</span>;

    const headerInformation =
        notam.type == "REPLACE" ? (
            <>
                {notamIdText} replaces{" "}
                <span className="font-mono text-sm">
                    {notam.previousNotam.series}/{notam.previousNotam.year - 2000}
                </span>
            </>
        ) : notam.type == "CANCEL" ? (
            <>Cancels {notamIdText}</>
        ) : (
            <>{notamIdText}</>
        );

    const locationInformation = (
        <>
            Location{notam.locationIndicators.length > 1 ? "s" : ""}:{" "}
            <span className="font-mono font-semibold">{notam.locationIndicators.join(", ")}</span>
            {notam.locationIndicators.includes(notam.fir) ? (
                <> (FIR)</>
            ) : (
                <>
                    <span className="pl-4"></span>
                    FIR: <span className="font-mono">{notam.fir}</span>
                </>
            )}
        </>
    );

    const heightInformation =
        notam.lowerLimit != null && notam.upperLimit != null ? (
            <>
                From <span className="font-mono">{notam.lowerLimit}</span> to <span className="font-mono">{notam.upperLimit}</span>
            </>
        ) : notam.qLower == 0 && notam.qUpper == 999 ? (
            <>No vertical limits specified</>
        ) : (
            <>
                From <span className="font-mono">FL{notam.qLower}</span> to <span className="font-mono">FL{notam.qUpper}</span>
            </>
        );

    const dateInformation = notam.isPermanent ? (
        <>Permanent</>
    ) : (
        <>
            From {new Date(notam.from).toLocaleString()}
            <br />
            To {new Date(notam.to).toLocaleString()} local time
            {notam.isEstimation && " (estimation)"}
        </>
    );

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                    <b>{toText(notam.notamCode)}</b>
                    <button
                        className="linklike pr-2"
                        onClick={(e) => {
                            setShowRaw(true);
                            e.stopPropagation();
                        }}
                    >
                        Show Raw
                    </button>
                    {/* <button onClick={() => console.log(notam)}>Log JSON</button> */}
                </div>
                <div>{headerInformation}</div>
                <div>{locationInformation}</div>
            </div>

            <div className="flex flex-col gap-1">
                <b>Validity</b>
                <div>{dateInformation}</div>
            </div>

            <div className="flex flex-col">
                <b>Affected Traffic</b>
                <span className="font-mono">{notam.traffic.join(", ")}</span>
            </div>

            <div className="flex flex-col gap-1">
                <b>NOTAM text</b>
                <div>
                    <FormattedNotamText text={notam.notamText}></FormattedNotamText>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <b>Vertical limits</b>
                <div>{heightInformation}</div>
            </div>
        </div>
    );
}

function FormattedNotamText({ text }: { text: string }) {
    const words = text.split(" ");
    return (
        <>
            {words
                .map((word) => {
                    if (word.toLowerCase().startsWith("https://") || word.toLowerCase().startsWith("http://")) {
                        const parts = word.split("/");
                        if (parts[2] == "") {
                            // only "https://"
                            return word;
                        }
                        parts[0] = parts[0].toLowerCase();
                        parts[2] = parts[2].toLowerCase();
                        word = parts.join("/");
                        return (
                            <a key={word} href={word} target="_blank">
                                {word}
                            </a>
                        );
                    }
                    return word;
                })
                .flatMap((element, index) => {
                    if (index == 0) {
                        return element;
                    }
                    return [" ", element];
                })}
        </>
    );
}
