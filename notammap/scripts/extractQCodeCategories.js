/*
    This script extracts the Q-Code categories for the first two letters from
    https://www.faa.gov/air_traffic/publications/atpubs/notam_html/appendix_b.html
    as json objects.
    Copy and paste in browser console.
*/

JSON.stringify(
    (() => {
        const tables = document.getElementsByTagName("table");

        const firstTables = 13;

        let categories = [];

        for (let i = 0; i < firstTables; i++) {
            const table = tables[i];
            const rows = table.querySelectorAll("tbody tr");
            const tableObject = {
                name: table
                    .querySelector("thead")
                    .innerText.replace(/\(.*\)/, "")
                    .trim(),
                codes: [],
            };
            categories.push(tableObject);

            for (const row of rows) {
                const key = row.querySelector("td:nth-child(1)").innerText;

                if (key != "Code" && key != "XX") {
                    tableObject.codes.push(key.substring(0, 2));
                }
            }
        }

        return categories;
    })()
);
