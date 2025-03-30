/*
    Extract country codes and names from https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements
    Copy and past in console, table selector might needs adjustments.
*/

JSON.stringify(
    (() => {
        const table = document.getElementsByTagName("table")[4];
        const data = {};
        let first = true;
        for (const row of table.querySelectorAll("tr")) {
            if (first) {
                first = false;
                continue;
            }
            const cols = row.querySelectorAll("td");
            data[cols[0].innerText] = cols[1].innerText;
        }
        return data;
    })()
);
