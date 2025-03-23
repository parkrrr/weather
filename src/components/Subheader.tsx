import React from 'preact/compat';
import { ObservationViewModel, ViewModelGenericTypes } from "../model/Model";
import style from './Subheader.module.scss';
import { Location } from './Location';

export function Subheader(props: { stationId: string, latestObservation: ObservationViewModel<ViewModelGenericTypes>, onStationIdChanged: (stationId: string | null) => void }) {
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    };

    if (!props.latestObservation) {
        return (
            <div className={style.subtitleItem}>
                <Location onStationIdChanged={props.onStationIdChanged} />
                <h2 className={style.subtitle}>{props.stationId}</h2>
            </div>
        )
    }
    else {
        const readableTimeStamp = props.latestObservation.timestamp.toLocaleString(navigator.language, dateFormatOptions);

        return (
            <div className={style.subtitleItem}>
                <Location onStationIdChanged={props.onStationIdChanged} />
                <h2 className={style.subtitle}>{props.stationId} at {readableTimeStamp}</h2>
            </div>
        )
    };
}