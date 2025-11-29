import { Observation } from "../weather-api/weather-gov-api";
import { ObservationViewModel, HumidityModel, TemperatureModel, WindModel, ViewModelGenericTypes } from "./Model";
import { PressureModel } from "./Model";

class View {
    constructor(viewName: string,
        referenceValue: number | null = null,
        nullCheck: (a: Observation) => boolean,
        viewModelFactory: (a: Observation) => ObservationViewModel<ViewModelGenericTypes>,
        valueAxisFormatter: (v: number) => string) {
        this.name = viewName;
        this.nullCheck = nullCheck;
        this.viewModelFactory = viewModelFactory;
        this.valueAxisFormatter = valueAxisFormatter;
        this.referenceValue = () => referenceValue;
    }

    // name of the view. this is displayed in the navigation buttons
    name: string;

    // a function to use as a null check, since it's different for each observation
    nullCheck: (a: Observation) => boolean;

    // how to convert from an Observation to an ObservationViewModel
    viewModelFactory: (a: Observation) => ObservationViewModel<ViewModelGenericTypes>;

    // optional. if supplied, the graph will always display this value on the y-axis
    referenceValue(): number | null { return null; }

    // how to format the y-axis labels
    valueAxisFormatter(v: number): string { return v.toFixed(0); }
}

const pressureView = new View("Pressure", 29.92,
    (v) => v.barometricPressure?.value == null,
    (v) => new PressureModel(v.timestamp!, v.barometricPressure!),
    (v) => v.toFixed(2));

const temperatureView = new View("Temp", null,
    (v) => v.temperature?.value == null,
    (v) => new TemperatureModel(v.timestamp!, v.temperature!),
    (v) => v.toFixed(1));

const humidityView = new View("Humidity", null,
    (v) => v.relativeHumidity?.value == null,
    (v) => new HumidityModel(v.timestamp!, v.relativeHumidity!),
    (v) => v.toFixed(1));

const dewpointView = new View("Dew Point", null,
    (v) => v.dewpoint?.value == null,
    (v) => new TemperatureModel(v.timestamp!, v.dewpoint!),
    (v) => v.toFixed(1));

const windView = new View("Wind", null,
    (v) => v.windSpeed?.value == null,
    (v) => new WindModel(v.timestamp!, v.windSpeed!, v.windDirection!),
    (v) => v.toFixed(1));

const getViewByName = (name: string | null): View | null => {
    const defaultView = pressureView;

    if (name == null) {
        return defaultView;
    }

    const view = views.find(v => v.name == name);
    if (view == undefined) {
        return defaultView;
    }

    return view;
}

const views = [temperatureView, dewpointView, humidityView, pressureView, windView];
export { View, views, getViewByName };
