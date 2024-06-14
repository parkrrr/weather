import { Observation, ObservationStationCollectionGeoJson, PointGeoJson, ProblemDetail } from "../spec/weather-gov-api";

type ExtendedProblemDetail = ProblemDetail & { parameterErrors?: { message: string, parameter: string }[] };

const userAgent = 'https://github.com/parkrrr/weather';

const throwErrorOrContinue = async (resp: Response) => {
    if (resp.status >= 400 && resp.status < 600) {
        const error = await resp.json() as ExtendedProblemDetail;
        if (error.parameterErrors) {
            const parameterErrorString = error.parameterErrors.map(pd => pd.message).join(', ')
            throw Error(parameterErrorString);
        }

        throw Error(error.detail);
    }
}


export const getObservations = async (airport: string, startDate: Date): Promise<Observation[]> => {
    const request = new Request(`https://api.weather.gov/stations/${airport}/observations?start=${startDate.toISOString()}`, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/geo+json',
            'User-Agent': userAgent,
        }),
    });

    const resp = await fetch(request);
    await throwErrorOrContinue(resp);

    const data = await resp.json() as ObservationStationCollectionGeoJson;
    const obs = data.features.map(((feat: { properties: Observation; }) => feat.properties));

    console.log(obs);
    obs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

    return obs;
}

export const getStationByLocation = async (location: GeolocationPosition): Promise<string> => {
    const request = new Request(`https://api.weather.gov/points/${location.coords.latitude},${location.coords.longitude}`, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/geo+json',
            'User-Agent': userAgent,
        }),
    });

    const resp = await fetch(request);

    await throwErrorOrContinue(resp);

    const data = await resp.json() as PointGeoJson;
    if (!data.properties.gridId || !data.properties.gridX || !data.properties.gridY) {
        throw new Error('Invalid grid data');
    }

    return await getStationByGridpoint(data.properties.gridId, data.properties.gridX, data.properties.gridY);
}

const getStationByGridpoint = async (gridId: string, gridX: number, gridY: number): Promise<string> => {

    const request = new Request(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/geo+json',
            'User-Agent': userAgent,
        }),
    });

    const resp = await fetch(request);

    await throwErrorOrContinue(resp);

    const data = await resp.json() as ObservationStationCollectionGeoJson;
    const station = data.features[0].properties.stationIdentifier;
    if (!station) {
        throw new Error('No station found');
    }

    return station;
}