import React, { useEffect, useState } from 'preact/compat';
import style from './Location.module.scss';
import { getStationsByLocation } from '../weather-api/getStationsByLocation';
import { StationPicker } from './StationPicker';
import { ObservationStationCollectionGeoJson } from '../weather-api/weather-gov-api';

export function Location(props: { onStationIdChanged: (stationId: string | null) => void }) {
    const [useGeolocation, setUseGeolocation] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selecting, setSelecting] = useState<boolean>(false);
    const [stations, setStations] = useState<ObservationStationCollectionGeoJson>();
    const [location, setLocation] = useState<GeolocationPosition | null>(null);

    useEffect(() => {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "granted" || result.state === "prompt") {
                    setUseGeolocation(true);
                } else {
                    setUseGeolocation(false);
                }
            });
        } else {
            setUseGeolocation(false);
        }
    }, []);

    const askForLocation = () => {
        const newStation = window.prompt("Enter station identifier");
        if (newStation) {
            props.onStationIdChanged(newStation);
        }
    }

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition(getStation, askForLocation, { enableHighAccuracy: false, timeout: 5000 });
    }

    const getStation = async (position: GeolocationPosition) => {
        try {
            setLocation(position);
            setLoading(true);
            await getStationsByLocation(position).then((stations) => {
                setStations(stations);
                setSelecting(true);
            });
        }
        catch {
            setSelecting(true); // show menu to display error
            setStations(undefined);
        }
        finally {
            setLoading(false);
        }
    }

    const onSelect = (stationIdentifier: string | null): void => {
        setSelecting(false);

        if (!stationIdentifier) {
            return;
        }

        props.onStationIdChanged(stationIdentifier);
    }

    const loadingIcon = (<div className={style.location}>
        <div className={style.button}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Z" /></svg>
        </div>
    </div>);

    const autolocateIcon = (<div id="autolocate" className={style.location}>
        <div className={style.button} onClick={getLocation}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
        </div>
    </div>);

    const editIcon = (<div id="edit" className={style.location}>
        <div className={style.button} onClick={askForLocation}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="24px">
                <path d="M0 0h24v24H0V0z" fill="none" /><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
            </svg>
        </div>
    </div>);
    
    if (useGeolocation) {
        const content = (<>{loading ? loadingIcon : autolocateIcon}{editIcon}</>);

        if (selecting && location) {
            return (
                <>
                    {content}
                    <StationPicker currentLatitude={location.coords.latitude} currentLongitude={location.coords.longitude} stations={stations} onStationChange={onSelect} />
                </>
            );
        }
        else {
            return content;
        }
    }

    return editIcon;
}