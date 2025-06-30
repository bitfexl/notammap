import categoriesCollections from "../../../assets/QCodeCategoriesCollections.json";
import categories from "../../../assets/QCodeCategories.json";
import { firstTablesTable } from "../../../assets/QCodeTables.json";
import { ReactNode, useState } from "react";
import detailsClosedIcon from "../../../assets/icons/chevron-right.svg?raw";
import detailsOpenIcon from "../../../assets/icons/chevron-down.svg?raw";
import { SVGIcon } from "../../icons/SVGIcon";

interface Category {
    name: string;
    codes: string[];
}

const categoriesCollectionWithCategories = categoriesCollections.map((c) => ({ ...c, categories: ((): Category[] => [])() }));
const otherCategories: Category[] = [];

for (const category of categories) {
    let added = false;
    for (const categoryCollection of categoriesCollectionWithCategories) {
        if (category.name.startsWith(categoryCollection.id + " ")) {
            categoryCollection.categories.push({ ...category, name: category.name.substring(categoryCollection.id.length + 1) });
            added = true;
            break;
        }
    }
    if (!added) {
        otherCategories.push(category);
    }
}

export interface QCodeFilterProps {
    /**
     * The qcodes currently displayed (active). (first and second letter)
     */
    codes: string[];

    /**
     * User changed the codes/filter.
     * @param codes The new codes (all active codes).
     */
    onCodesChange: (codes: string[]) => void;
}

export function QCodeFilter({ codes: selectedCodes, onCodesChange: setSelectedCodes }: QCodeFilterProps) {
    function updateCodes(codes: string[], selected: boolean) {
        let newCodes;
        if (selected) {
            newCodes = [...selectedCodes];
            for (const code of codes) {
                if (!newCodes.includes(code)) {
                    newCodes.push(code);
                }
            }
        } else {
            newCodes = selectedCodes.filter((c) => !codes.includes(c));
        }
        setSelectedCodes(newCodes);
    }

    return (
        <div className="flex flex-col">
            {categoriesCollectionWithCategories.map((cc) => (
                <CategoryCollectionComponent
                    name={cc.id.length == 3 ? `(${cc.id}) ${cc.name}` : cc.name}
                    categories={cc.categories}
                    selectedCodes={selectedCodes}
                    updateCodes={updateCodes}
                    key={cc.id}
                ></CategoryCollectionComponent>
            ))}
            {otherCategories.map((c) => (
                <CategoryComponent category={c} selectedCodes={selectedCodes} updateCodes={updateCodes} key={c.name}></CategoryComponent>
            ))}
        </div>
    );
}

function CategoryCollectionComponent({
    name,
    categories,
    selectedCodes,
    updateCodes,
}: {
    name: string;
    categories: Category[];
    selectedCodes: string[];
    updateCodes: (codes: string[], selected: boolean) => void;
}) {
    const [detailsOpen, setDetailsOpen] = useState(false);

    const codesInCategoryCollection = categories.flatMap((c) => c.codes);
    const selectedCodesInCategoryCollection = selectedCodes.filter((c) => codesInCategoryCollection.includes(c));

    return (
        <div>
            <Details
                open={detailsOpen}
                header={
                    <span className="flex gap-2">
                        <Checkbox
                            onChange={(checked) => updateCodes(codesInCategoryCollection, checked)}
                            state={
                                selectedCodesInCategoryCollection.length == 0
                                    ? "none"
                                    : selectedCodesInCategoryCollection.length == codesInCategoryCollection.length
                                    ? "all"
                                    : "partial"
                            }
                        ></Checkbox>
                        <button className="nostyle text-left inline-flex" onClick={() => setDetailsOpen(!detailsOpen)}>
                            <SVGIcon svg={detailsOpen ? detailsOpenIcon : detailsClosedIcon} inline></SVGIcon>
                            <span className="underline">{name}</span>
                        </button>
                    </span>
                }
            >
                <div className="flex flex-col">
                    {categories.map((c) => (
                        <div className="pl-[21px]">
                            <CategoryComponent
                                category={c}
                                selectedCodes={selectedCodes}
                                updateCodes={updateCodes}
                                key={c.name}
                            ></CategoryComponent>
                        </div>
                    ))}
                </div>
            </Details>
        </div>
    );
}

function CategoryComponent({
    category,
    selectedCodes,
    updateCodes,
}: {
    category: Category;
    selectedCodes: string[];
    updateCodes: (codes: string[], selected: boolean) => void;
}) {
    const [detailsOpen, setDetailsOpen] = useState(false);

    const codesInCategory = category.codes;
    const selectedCodesInCategory = selectedCodes.filter((c) => codesInCategory.includes(c));

    return (
        <div>
            <Details
                open={detailsOpen}
                header={
                    <span className="flex gap-2">
                        <Checkbox
                            onChange={(checked) => updateCodes(codesInCategory, checked)}
                            state={
                                selectedCodesInCategory.length == 0
                                    ? "none"
                                    : selectedCodesInCategory.length == codesInCategory.length
                                    ? "all"
                                    : "partial"
                            }
                        ></Checkbox>

                        <button className="nostyle text-left inline-flex" onClick={() => setDetailsOpen(!detailsOpen)}>
                            <SVGIcon svg={detailsOpen ? detailsOpenIcon : detailsClosedIcon} inline></SVGIcon>
                            <span className="underline">{category.name}</span>
                        </button>
                    </span>
                }
            >
                <ul className="pl-[21px]">
                    {category.codes.map((c) => (
                        <li key={c}>
                            <label className="flex gap-2">
                                <input
                                    onChange={(e) => updateCodes([c], e.target.checked)}
                                    checked={selectedCodesInCategory.includes(c)}
                                    type="checkbox"
                                    className="self-start h-6"
                                />
                                <span>
                                    (<code>{c}</code>) {(firstTablesTable as any)[c]}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
            </Details>
        </div>
    );
}

function Checkbox({ state, onChange }: { state: "all" | "none" | "partial"; onChange: (checked: boolean) => void }) {
    return (
        <input
            onChange={(e) => onChange(e.target.checked)}
            checked={state == "all"}
            ref={(r) => {
                if (r) r.indeterminate = state == "partial";
            }}
            type="checkbox"
            className="self-start h-6"
        />
    );
}

function Details({ open, header, children }: { open: boolean; header: ReactNode; children: ReactNode }) {
    return (
        <div>
            {header}
            {open && <div className="pb-2">{children}</div>}
        </div>
    );
}
