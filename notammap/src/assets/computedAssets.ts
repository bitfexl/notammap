import countryCodes from "./countryCodes.json";

export const reversedCountryCodes = (() => {
    const object: any = {};
    for (const code of Object.keys(countryCodes)) {
        object[(countryCodes as any)[code]] = code;
    }
    return object;
})();
