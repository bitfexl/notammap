import qcodeTables from "../../assets/QCodeTables.json";

/**
 * Parse a q-code to human readable text.
 * @param qcode The five letter q code, with additional text if provided.
 */
export function toText(qcode: string) {
    // notam is checklist
    if (qcode == "QKKKK" || qcode == "QKKXX") {
        return "Checklist";
    }

    const code1 = qcode.substring(1, 3);
    const code2 = qcode.substring(3, 5);

    let part1: string = (qcodeTables.firstTablesTable as any)[code1] ?? "('" + code1 + "' unknown)";
    let part2: string = (qcodeTables.secondTablesTable as any)[code2] ?? "('" + code2 + "' unknown)";

    // add free part if it exists
    if (code2 == "XX" && qcode.length > 5) {
        part2 = qcode.split(" ", 2)[1];
    } else if (code2 == "XX") {
        part2 = "";
    } else if (code2 == "TT") {
        part2 = "trigger NOTAM (AIP changes)";
    }

    // lowercase first char
    part2 = part2.charAt(0).toLowerCase() + part2.substring(1);

    return part1 + " " + part2;
}
