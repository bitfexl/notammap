import { toText } from "../../api/notams/QCodes";
import { DetailedNotam, TextNode } from "../../api/notams/notamextractor";
import { useState } from "react";
import { plural } from "../../utils/textUtils";

export interface NotamComponentProps {
    /**
     * The notam to display.
     */
    detailedNotam: DetailedNotam;
}

const dataMissingText = "not specified";

export function NotamComponent({ detailedNotam }: NotamComponentProps) {
    const [showRaw, setShowRaw] = useState(false);

    const notam = detailedNotam.notam;

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

    let notamIdText = <span className="font-mono text-sm">Notam id {dataMissingText}</span>;
    try {
        const notamId = notam.series! + notam.number + "/" + (notam.year! - 2000);
        notamIdText = <span className="font-mono text-sm">{notamId}</span>;
    } catch {}

    const headerInformation =
        notam.type == "REPLACE" ? (
            <>
                {notamIdText} replaces{" "}
                {notam.previousNotam ? (
                    <span className="font-mono text-sm">
                        {notam.previousNotam.series}
                        {notam.previousNotam.number}/{(notam.previousNotam.year ?? 2000) - 2000}
                    </span>
                ) : (
                    dataMissingText
                )}
            </>
        ) : notam.type == "CANCEL" ? (
            <>Cancels {notamIdText}</>
        ) : (
            <>{notamIdText}</>
        );

    const locationInformation = (
        <div className="flex flex-col gap-1">
            <b>{plural("Location", notam.locationIndicators?.length ?? 0)}</b>
            {notam.locationIndicators ? (
                <div>
                    <span className="font-mono font-semibold">{notam.locationIndicators.join(", ")}</span>
                    {notam.locationIndicators.includes(notam.fir ?? "NOT_A_VALID_FIR") ? (
                        <> (FIR)</>
                    ) : (
                        <>
                            <span className="pl-4"></span>
                            FIR: <span className="font-mono">{notam.fir}</span>
                        </>
                    )}
                </div>
            ) : (
                <>{dataMissingText}</>
            )}
        </div>
    );

    const heightInformation =
        notam.lowerLimit != null && notam.upperLimit != null ? (
            <>
                From <span className="font-mono">{notam.lowerLimit}</span> to <span className="font-mono">{notam.upperLimit}</span>
            </>
        ) : notam.qLower == 0 && notam.qUpper == 999 ? (
            <>No vertical limits specified</>
        ) : (
            // TODO: icao doc 8126:
            // The lower and upper limits are expressed in thousands of feet below the transition altitude and flight levels (FL) above it.
            // ???
            // TODO: if undefined
            <>
                From <span className="font-mono">{notam.qLower == 0 ? "GND" : "FL" + notam.qLower}</span> to{" "}
                <span className="font-mono">FL{notam.qUpper}</span>
            </>
        );

    const dateInformation = notam.isPermanent ? (
        <>Permanent</>
    ) : (
        <>
            From {notam.from ? new Date(notam.from).toLocaleString() : dataMissingText}
            <br />
            To {notam.to ? new Date(notam.to).toLocaleString() : dataMissingText} local time
            {notam.isEstimation && " (estimation)"}
        </>
    );

    const isChecklist = notam.notamCode == "QKKKK";

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                    <b>{notam.notamCode ? toText(notam.notamCode) : "NOTAM code " + dataMissingText}</b>
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

            {!isChecklist && (
                <div className="flex flex-col">
                    <b>Affected Traffic</b>
                    <span className="font-mono">{notam.traffic ? notam.traffic.join(", ") : dataMissingText}</span>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <b>NOTAM text</b>
                <div>
                    {detailedNotam.textNodes ? (
                        <FormattedNotamText textNodes={detailedNotam.textNodes}></FormattedNotamText>
                    ) : (
                        notam.notamText ?? dataMissingText
                    )}
                </div>
            </div>

            {!isChecklist && (
                <div className="flex flex-col gap-1">
                    <b>Vertical limits</b>
                    <div>{heightInformation}</div>
                </div>
            )}
        </div>
    );
}

function FormattedNotamText({ textNodes }: { textNodes: TextNode[] }) {
    return (
        <>
            {textNodes.map((node) => {
                if (node.reference?.coordinatesList) {
                    return <a href="javascript:alert('TODO')">view on map</a>;
                } else if (node.reference?.webLink) {
                    return (
                        <a href={node.reference.webLink} target="_blank">
                            {node.text}
                        </a>
                    );
                } else if (node.reference?.abbreviation) {
                    return node.text; // TODO: long form
                } else {
                    return node.text;
                }
            })}
        </>
    );
}
