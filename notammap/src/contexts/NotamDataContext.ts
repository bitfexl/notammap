import { createContext } from "react";
import { NotamData } from "../api/notams/notamextractor";
import { defaultFilterOptions, NotamFilterOptions } from "../lib/menu/filter/notamFilter";

export interface NotamDataContextProps {
    /**
     * The currently loaded notam data (complete data for current country).
     */
    notamData: NotamData;

    setNotamData: (notamData: NotamData) => void;

    /**
     * The current country for which the data has been loaded.
     */
    country: string;

    setCountry: (country: string) => void;

    /**
     * The current notam filter options.
     */
    filterOptions: NotamFilterOptions;

    setFilterOptions: (filterOptions: NotamFilterOptions) => void;

    /**
     * Notamdata with the filter options applied.
     */
    filteredNotamData: NotamData;

    setFilteredNotamData: (filteredNotamData: NotamData) => void;
}

const NOOP = () => {};

export const NotamDataContext = createContext<NotamDataContextProps>({
    notamData: {
        version: "0.0",
        notams: [],
        coordinatesLists: [],
    },
    country: "",
    filterOptions: defaultFilterOptions,
    filteredNotamData: {
        version: "0.0",
        notams: [],
        coordinatesLists: [],
    },

    setNotamData: NOOP,
    setCountry: NOOP,
    setFilterOptions: NOOP,
    setFilteredNotamData: NOOP,
});

export function createInteractiveNotamDataContext(
    notamContext: NotamDataContextProps,
    setNotamContext: (notamContext: NotamDataContextProps) => never
): NotamDataContextProps {
    function set(object: any) {
        setNotamContext(createInteractiveNotamDataContext({ ...notamContext, ...object }, setNotamContext));
    }

    return {
        ...notamContext,
        setNotamData(notamData) {
            set({ notamData });
        },
        setCountry(country) {
            set({ country });
        },
        setFilterOptions(filterOptions) {
            set({ filterOptions });
        },
        setFilteredNotamData(filteredNotamData) {
            set({ filteredNotamData });
        },
    };
}
