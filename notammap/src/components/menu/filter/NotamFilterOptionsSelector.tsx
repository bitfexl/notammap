import { CheckBoxInputs } from "../../form/CheckBoxInputs";
import { NotamFilterOptions } from "./notamFilter";
import { QCodeFilter } from "./QCodeFilter";
import { Help } from "../../form/Help";
import { useEffect } from "react";

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

    // update date on init if no custom selection has been made
    useEffect(() => {
        if (options.DATE.DAYS != -1) {
            updateDate(options.DATE.DAYS, null, null);
        }
    }, []);

    function updateDate(days: number | null, from: string | null, to: string | null) {
        if (days != null) {
            if (days == -1) {
                // only set to custom, custom date can be changed via inputs (from, to)
                update((o) => (o.DATE.DAYS = -1));
            } else {
                // update period and from, to inputs
                update((o) => {
                    const today = new Date();
                    const end = new Date();
                    end.setDate(end.getDate() + days - 1);
                    o.DATE.DAYS = days;
                    o.DATE.FROM = today.toISOString().split("T")[0];
                    o.DATE.TO = end.toISOString().split("T")[0];
                });
            }
        } else if (from != null) {
            update((o) => {
                o.DATE.FROM = from;
                o.DATE.DAYS = -1;
            });
        } else if (to != null) {
            update((o) => {
                o.DATE.TO = to;
                o.DATE.DAYS = -1;
            });
        }
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
                <select value={options.DATE.DAYS} onChange={(d) => updateDate(parseInt(d.target.value), null, null)}>
                    <option value={1}>Today</option>
                    <option value={7}>Next 7 days</option>
                    <option value={14}>Next 14 days</option>
                    <option value={30}>Next 30 days</option>
                    <option value={-1}>Custom</option>
                </select>
                <div>
                    <label>
                        From
                        <input type="date" value={options.DATE.FROM} onChange={(f) => updateDate(null, f.target.value, null)} />
                    </label>
                    <label>
                        To
                        <input type="date" value={options.DATE.TO} onChange={(t) => updateDate(null, null, t.target.value)} />
                    </label>
                </div>
            </div>
        </div>
    );
}
