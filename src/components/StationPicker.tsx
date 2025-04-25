import React from 'preact/compat';
import style from './StationPicker.module.scss'
import { GeoJsonGeometry, GeometryString, ObservationStation, ObservationStationCollectionGeoJson } from '../weather-api/weather-gov-api';



export function StationPicker(props: { currentLatitude: number, currentLongitude: number, stations: ObservationStationCollectionGeoJson | undefined, onStationChange: (stationIdentifier: string | null) => void }) {
    const getDistanceInMilesByCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const toRadians = (degrees: number) => degrees * (Math.PI / 180);

        const R = 3958.8; // Radius of the Earth in miles
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    if (!props.stations) {
        return (
            <ul className={style.menu}>
                <li onClick={() => props.onStationChange(null)}>No stations found</li>
            </ul>);

    }

    return (
        <ul className={style.menu}>
            {props.stations.features.slice(0, 5).map((station) => {
                const properties: ObservationStation = station.properties || {} as ObservationStation;

                const geometry = station.geometry as GeometryString & GeoJsonGeometry | undefined;

                let label = `${properties.name} (${properties.stationIdentifier})`;

                if (geometry) {
                    const longitude = geometry.coordinates[0] as number;
                    const latitude = geometry.coordinates[1] as number;
                    const distance = getDistanceInMilesByCoordinates(props.currentLatitude, props.currentLongitude, latitude, longitude);
                    label = `${properties.name} (${properties.stationIdentifier}, ${distance.toFixed(1)} mi)`;
                }

                return (
                    <li key={properties.stationIdentifier} onClick={() => properties.stationIdentifier && props.onStationChange(properties.stationIdentifier)}>{label}</li>
                )
            })}
        </ul>
    )
}