import { USER_AGENT } from "./constants";
import { throwErrorOrContinue } from "./throwErrorOrContinue";
import { ObservationStationCollectionGeoJson, PointGeoJson } from "./weather-gov-api";

export const getStationsByLocation = async (location: GeolocationPosition): Promise<ObservationStationCollectionGeoJson> => {
    const request = new Request(`https://api.weather.gov/points/${location.coords.latitude},${location.coords.longitude}`, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/geo+json',
            'User-Agent': USER_AGENT,
        }),
    });

    const resp = await fetch(request);

    await throwErrorOrContinue(resp);

    const data = await resp.json() as PointGeoJson;
    if (!data.properties.gridId || !data.properties.gridX || !data.properties.gridY) {
        throw new Error('Invalid grid data');
    }

    return await getStationsByGridpoint(data.properties.gridId, data.properties.gridX, data.properties.gridY);
}

const getStationsByGridpoint = async (gridId: string, gridX: number, gridY: number): Promise<ObservationStationCollectionGeoJson> => {

    const request = new Request(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`, {
        method: 'GET',
        headers: new Headers({
            'Accept': 'application/geo+json',
            'User-Agent': USER_AGENT,
        }),
    });

    const resp = await fetch(request);

    await throwErrorOrContinue(resp);

    const data = await resp.json() as ObservationStationCollectionGeoJson;
    if (!data || !Array.isArray(data.features) || data.features.length === 0) {
        throw new Error('No station found');
    }

    return data;
}