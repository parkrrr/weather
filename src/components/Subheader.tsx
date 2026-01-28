import React, { useEffect, useState } from 'preact/compat';
import { ObservationViewModel, ViewModelGenericTypes } from "../model/Model";
import style from './Subheader.module.scss';
import { Location } from './Location';

export function Subheader(props: { 
    stationId: string,
    latestObservation: ObservationViewModel<ViewModelGenericTypes>,
    onStationIdChanged: (stationId: string | null) => void,
    metarOnly?: boolean
    onMetarOnlyChanged?: (metarOnly: boolean) => void
}) {
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short'
    };

    const [metarOnly, setMetarOnly] = useState<boolean>(props.metarOnly ?? false);

    useEffect(() => {
        props.onMetarOnlyChanged?.(metarOnly);
    }, [metarOnly]);
    
    const metarOnlyIcon = (<div id="metar-only" className={style.location}>
        <div className={style.button} onClick={() => setMetarOnly(!metarOnly)}>
            <div className={style.buttonIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                </svg>
            </div>
        </div>
    </div>);

    const allDataIcon = (<div id="all-data" className={style.location}>
        <div className={style.button} onClick={() => setMetarOnly(!metarOnly)}>
            <div className={style.buttonIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
            </div>
        </div>
    </div>);

    if (!props.latestObservation) {
        return (
            <div className={style.subtitleItem}>
                <Location stationId={props.stationId} onStationIdChanged={props.onStationIdChanged} />
            </div>
        )
    }
    else {
        const readableTimeStamp = props.latestObservation.timestamp.toLocaleString(navigator.language, dateFormatOptions);

        return (
            <div className={style.subtitleItem}>
                <Location stationId={props.stationId} onStationIdChanged={props.onStationIdChanged} />
                {metarOnly ? metarOnlyIcon : allDataIcon}
                <h2 className={style.subtitle}> at {readableTimeStamp}</h2>
            </div>
        )
    };
}