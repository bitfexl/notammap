import { Notam } from "../notams/notamextractor";

export interface NotamComponentProps {
    /**
     * The notam to display.
     */
    notam: Notam;
}

export function NotamComponent({ notam }: NotamComponentProps) {
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
            <>Cancles {notamIdText}</>
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
                    FIR:
                    <span className="font-mono">{notam.fir}</span>
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
                <b>{notam.notamCode}</b>
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
                <div>{notam.notamText}</div>
            </div>

            <div className="flex flex-col gap-1">
                <b>Vertical limits</b>
                <div>{heightInformation}</div>
            </div>
        </div>
    );
}
