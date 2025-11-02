import { SVGIcon } from "../icons/SVGIcon";

import searchIcon from "../../assets/icons/search.svg?raw";
import { ReactNode, useState } from "react";

export interface SearchProps {
    placeholder: string;
    results?: {
        key: any;
        content: ReactNode;
    }[];
    showResults: boolean;
    onSearch: (value: string) => void;
    onSelect: (key: any) => void;
}

export function Search({ placeholder, results, onSearch, showResults, onSelect }: SearchProps) {
    const [searchContent, setSearchContent] = useState<string>("");

    return (
        <div className="flex flex-col gap-4">
            <label className="flex flex-row">
                <SVGIcon svg={searchIcon} inline></SVGIcon>
                <input
                    type="text"
                    placeholder={placeholder}
                    className="ml-2 w-full border-b-2 border-gray-400 outline-none focus:border-gray-700"
                    value={searchContent}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchContent(value);
                        onSearch(value);
                    }}
                />
            </label>
            {/* pr-2 -mr-2 to move scrollbar */}
            {showResults && results && (
                <div className="flex flex-col gap-2 max-h-80 overflow-auto pr-2 -mr-2">
                    {results.map((r) => (
                        <button key={r.key} onClick={() => onSelect(r.key)}>
                            <div className="text-left pl-2 pr-2">{r.content}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
