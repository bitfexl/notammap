/*
    This script extracts the Q-Code tables from
    https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html
    as json objects.
    Copy and paste in browser console.
*/

JSON.stringify(
    (() => {
        const tables = document.getElementsByTagName("table");

        let firstTables = 13;

        let firstTablesTable = {};
        let secondTablesTable = {};

        for (const table of tables) {
            const rows = table.querySelectorAll("tbody tr");
            const tableObject = {};

            for (const row of rows) {
                const key = row.querySelector("td:nth-child(1)").innerText;
                let value = row.querySelector("td:nth-child(2)").innerText;

                value = value.replace(/\(.*\)/, "");
                value = value.replace("  ", " ");
                value = value.trim();

                if (key != "Code" && key != "XX") {
                    tableObject[key.substring(0, 2)] = value;
                }
            }

            if (firstTables > 0) {
                Object.assign(firstTablesTable, tableObject);
            } else {
                Object.assign(secondTablesTable, tableObject);
            }

            firstTables--;
        }

        return {
            firstTablesTable,
            secondTablesTable,
        };
    })()
);
