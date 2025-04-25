import React from 'preact/compat';
import style from './StationPicker.module.scss'
import { ObservationStation } from '../weather-api/weather-gov-api';

export function StationPicker(props: { stations: ObservationStation[], onStationChange: (stationIdentifier: string) => void }) {
    return (
        <ul className={style.menu}>
            {props.stations.slice(0,5).map((station) => (
                <li key={station.stationIdentifier} onClick={() => station?.stationIdentifier && props.onStationChange(station.stationIdentifier)}>{station.name} ({station.stationIdentifier})</li>
            ))}
        </ul>
    )
}