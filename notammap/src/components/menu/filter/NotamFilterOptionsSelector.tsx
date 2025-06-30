import { useState } from "react";
import { CheckBoxInputs } from "../../form/CheckBoxInputs";
import { NotamFilterOptions } from "./notamFilter";
import { QCodeFilter } from "./QCodeFilter";

export interface NotamFilterOptionsSelectorProps {
    /**
     * Called when the filter options are changed.
     * @param filter The new filter options.
     */
    onChange: (options: NotamFilterOptions) => any;

    /**
     * The currently selected options.
     */
    options: NotamFilterOptions;
}

export function NotamFilterOptionsSelector({ onChange, options }: NotamFilterOptionsSelectorProps) {
    const [qCodes, setQCodes] = useState<string[]>([]);

    function update(updater: (options: NotamFilterOptions) => any) {
        let clone = structuredClone(options);
        updater(clone);
        onChange(clone);
    }

    return (
        <div className="flex flex-col gap-4">
            <CheckBoxInputs
                label="Traffic"
                help={<>The affected Traffic.</>}
                checkBoxes={[
                    {
                        label: "VFR",
                        key: "VFR",
                        help: <>Show NOTAMs relevant for VFR flights.</>,
                        checked: options.TRAFFIC.VFR,
                    },
                    {
                        label: "IFR",
                        key: "IFR",
                        help: <>Show NOTAMs relevant for IFR flights.</>,
                        checked: options.TRAFFIC.IFR,
                    },
                ]}
                onChange={(key, val) => update((o) => ((o.TRAFFIC as any)[key] = val))}
            ></CheckBoxInputs>

            <CheckBoxInputs
                label="Purpose"
                help={<>The NOTAM Purpose.</>}
                checkBoxes={[
                    {
                        label: "Immediate Attention",
                        key: "IMMEDIATE_ATTENTION",
                        help: <>I am help.</>,
                        checked: options.PURPOSE.IMMEDIATE_ATTENTION,
                    },
                    {
                        label: "Bulletin",
                        key: "BULLETIN",
                        help: <>I am help.</>,
                        checked: options.PURPOSE.BULLETIN,
                    },
                    {
                        label: "Operations",
                        key: "OPERATIONS",
                        help: <>I am help.</>,
                        checked: options.PURPOSE.OPERATIONS,
                    },
                    {
                        label: "Miscellaneous",
                        key: "MISCELLANEOUS",
                        help: <>I am help.</>,
                        checked: options.PURPOSE.MISCELLANEOUS,
                    },
                ]}
                onChange={(key, val) => update((o) => ((o.PURPOSE as any)[key] = val))}
            ></CheckBoxInputs>

            <QCodeFilter codes={qCodes} onCodesChange={setQCodes}></QCodeFilter>

            <CheckBoxInputs
                label="Q-Code"
                help={
                    <>
                        The subject being reported.
                        <br />
                        See: <a href="https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html">Q-Code Tables</a>
                    </>
                }
                checkBoxes={[
                    {
                        label: "Obstacles",
                        key: "OBSTACLES",
                        help: <>Obstacle NOTAMs (QOBXX, QOLXX).</>,
                        checked: options.QCODES.OBSTACLES,
                    },
                    {
                        label: "Airspace Restrictions",
                        key: "AIRSPACE_RESTRICTIONS",
                        help: <>Navigation Warnings: Airspace Restrictions (QRXXX).</>,
                        checked: options.QCODES.AIRSPACE_RESTRICTIONS,
                    },
                    {
                        label: "Warnings",
                        key: "WARNINGS",
                        help: <>Navigation Warnings: Warnings (QWXXX).</>,
                        checked: options.QCODES.WARNINGS,
                    },
                    {
                        label: "ATM",
                        key: "ATM",
                        help: <>Air Traffic Management (QAXXX, QPXXX, QSXXX).</>,
                        checked: options.QCODES.ATM,
                    },
                    {
                        label: "CNS",
                        key: "CNS",
                        help: <>Communication, Navigation, Surveillance (QCXXX, QGXXX, QIXXX).</>,
                        checked: options.QCODES.CNS,
                    },
                    {
                        label: "AGA",
                        key: "AGA",
                        help: <>Aerodromes and Ground Aids (QFXXX, QLXXX, QMXXX).</>,
                        checked: options.QCODES.AGA,
                    },
                    {
                        label: "COM",
                        key: "COM",
                        help: <>Communication (QNXXX).</>,
                        checked: options.QCODES.COM,
                    },
                ]}
                onChange={(key, val) => update((o) => ((o.QCODES as any)[key] = val))}
            ></CheckBoxInputs>

            <div>
                <b>Date (not yet implemented)</b>
                <div>
                    <label>
                        From
                        <input type="date" />
                    </label>
                    <label>
                        To
                        <input type="date" />
                    </label>
                </div>
            </div>
        </div>
    );
}
