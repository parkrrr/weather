import { QuantitativeValue } from "../spec/weather-gov-api";

export function pascalsToInchesMercury(pascals: number) { return pascals * 0.0002953 };
export function celciusToFahrenheit(c: number) { return (c * 1.8) + 32; }
export function kilometersToMiles(km: number) { return km * 0.621371; }
export function parseQualityControl(qualityCode: "Z" | "C" | "S" | "V" | "X" | "Q" | "G" | "B" | "T" | undefined): boolean | null {
    switch (qualityCode) {
        case "B":
        case "Q":
        case "X":
            return false;
        case "C":
        case "G":
        case "S":
        case "T":
        case "V":
            return true;
        case "Z":
        default:
            return null;
    }
}
export function degreesToCardinalDirection(degrees: number) {
    const directions = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
    return directions[Math.round(degrees / 45) % 8];
}

// All possible types that a view model might take
export type ViewModelGenericTypes = number | [number, number];

export abstract class ObservationViewModel<T> {
    value: T;
    timestamp: Date;
    hasPassedQualityControl: boolean | null = null;

    constructor(timestamp: string, quantitativeValue: QuantitativeValue) {
        this.timestamp = new Date(timestamp);
        this.hasPassedQualityControl = parseQualityControl(quantitativeValue.qualityControl);
    }

    abstract formatValue(): string;

    toDataPoint(): { x: Date, y: number } {
        return {
            x: this.timestamp,
            y: this.value as number
        }
    };
}

export class PressureModel extends ObservationViewModel<number> {
    constructor(timestamp: string, quantitativeValue: QuantitativeValue) {
        super(timestamp, quantitativeValue);
        this.value = pascalsToInchesMercury(quantitativeValue.value!);
    }

    formatValue() {
        return `${this.value.toFixed(2)} inHg`;
    }
}

export class TemperatureModel extends ObservationViewModel<number> {
    constructor(timestamp: string, quantitativeValue: QuantitativeValue) {
        super(timestamp, quantitativeValue);
        this.value = celciusToFahrenheit(quantitativeValue.value!);
    }

    formatValue() {
        return `${this.value.toFixed(0)} °F`;
    }
}

export class HumidityModel extends ObservationViewModel<number> {
    constructor(timestamp: string, quantitativeValue: QuantitativeValue) {
        super(timestamp, quantitativeValue);
        this.value = quantitativeValue.value!;
    }

    formatValue() {
        return `${this.value.toFixed(0)}%`;
    }
}

export class WindModel extends ObservationViewModel<[number, number]> {
    constructor(timestamp: string, windSpeed: QuantitativeValue, windDirection: QuantitativeValue) {
        super(timestamp, windSpeed);
        this.value = [kilometersToMiles(windSpeed.value!), windDirection.value!];
    }

    toDataPoint() {
        return {
            x: this.timestamp,
            y: this.value[0]
        }
    };

    formatValue() {
        if (this.value[1] == 0 && this.value[0] == 0) {
            return `Calm`;
        }

        return `From the ${degreesToCardinalDirection(this.value[1])} at ${this.value[0].toFixed(0)} MPH`;
    }
}