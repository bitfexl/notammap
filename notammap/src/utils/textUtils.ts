export function plural(word: string, count: number, pluralForm?: string) {
    if (count == 1) {
        return word;
    }
    return pluralForm ?? word + "s";
}
