import { CheckBoxInputs } from "../../form/CheckBoxInputs";
import { NotamFilterOptions } from "./notamFilter";
import { QCodeFilter } from "./QCodeFilter";
import { Help } from "../../form/Help";

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

            <CheckBoxInputs
                label="Scope"
                help={<>The Scope of the NOTAM subject.</>}
                checkBoxes={[
                    {
                        label: "Aerodrome",
                        key: "AERODROME",
                        help: <>I am help.</>,
                        checked: options.SCOPE.AERODROME,
                    },
                    {
                        label: "En-route",
                        key: "ENROUTE",
                        help: <>I am help.</>,
                        checked: options.SCOPE.ENROUTE,
                    },
                    {
                        label: "Nav warning",
                        key: "NAV_WARNING",
                        help: <>I am help.</>,
                        checked: options.SCOPE.NAV_WARNING,
                    },
                    {
                        label: "NOTAM Checklist",
                        key: "CHECKLIST",
                        help: <>I am help.</>,
                        checked: options.SCOPE.CHECKLIST,
                    },
                ]}
                onChange={(key, val) => update((o) => ((o.SCOPE as any)[key] = val))}
            ></CheckBoxInputs>

            <div>
                <div className="flex flex-row justify-between gap-4">
                    <b>Q-Code</b>
                    <Help>
                        The subject being reported.
                        <br />
                        See: <a href="https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html">Q-Code Tables</a>
                    </Help>
                </div>
                <QCodeFilter codes={options.QCODES} onCodesChange={(c) => update((o) => (o.QCODES = c))}></QCodeFilter>
            </div>

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
