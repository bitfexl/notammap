import { Help } from "./Help";

export interface CheckBoxInputsProps {
    /**
     * The label of the checkbox group.
     */
    label: string;

    /**
     * The help message to display for this input group.
     */
    help: React.ReactNode;

    /**
     * The checkboxes in this input group.
     */
    checkBoxes: {
        /**
         * The label of the checkbox.
         */
        label: string;

        /**
         * A unique key.
         */
        key: string;

        /**
         * The help to display when hovering the help icon of the checkbox.
         */
        help: React.ReactNode;

        /**
         * Wether the current value should be checked or not.
         */
        checked: boolean;
    }[];

    /**
     * Called when a checkboxes value is changed.
     * @param key The key of the checkbox.
     * @param checked The new state.
     */
    onChange: (key: string, checked: boolean) => any;
}

/**
 * A input group of multiple checkboxes.
 */
export function CheckBoxInputs({ label, help, checkBoxes, onChange }: CheckBoxInputsProps) {
    return (
        <div className="inline-flex flex-col w-max">
            <div className="flex flex-row justify-between gap-4">
                <b>{label}</b>
                <Help>{help}</Help>
            </div>

            {checkBoxes.map((checkbox) => (
                <div key={checkbox.key} className="flex flex-row justify-between gap-4">
                    <label className="flex gap-2">
                        <input
                            type="checkbox"
                            defaultChecked={checkbox.checked}
                            onChange={(e) => onChange(checkbox.key, e.target.checked)}
                        />
                        <span className="select-none">{checkbox.label}</span>
                    </label>
                    <Help>{checkbox.help}</Help>
                </div>
            ))}
        </div>
    );
}
