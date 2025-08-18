export function coordinatesToString(latitude: number, longitude: number) {
    return decimalToString(latitude) + " " + decimalToString(longitude, false);
}

export function decimalToString(decimal: number, isLatitude = true) {
    const absolute = Math.abs(decimal);
    let degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    let minutes = Math.floor(minutesNotTruncated);
    if (minutes == 60) {
        minutes = 0;
        degrees++;
    }
    let seconds = Math.round((minutesNotTruncated - minutes) * 60 * 100) / 100;
    if (seconds == 60) {
        seconds = 0;
        minutes++;
    }

    let direction;
    if (isLatitude) {
        direction = decimal >= 0 ? "N" : "S";
    } else {
        direction = decimal >= 0 ? "E" : "W";
    }

    return `${degrees}\u00BA ${minutes}\u2032 ${seconds}\u2033 ${direction}`;
}
