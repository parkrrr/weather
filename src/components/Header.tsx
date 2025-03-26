import React from 'preact/compat';
import { useEffect, useState } from "preact/hooks";
import { ObservationViewModel, ViewModelGenericTypes } from "../model/Model"
import style from './Header.module.scss'

export function Header(props: { latestObservation: ObservationViewModel<ViewModelGenericTypes>, now: Date }) {
    if (!props.latestObservation) return null;

    const getRelativeDateString = () => {
        const n = Math.floor(props.now.getTime() / 1000);
        const t = new Date(props.latestObservation.timestamp).getTime() / 1000;
        const dateDiff = t - n;

        const second = 1,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24;

        const absDateDiff = Math.abs(dateDiff);

        const rtf = new Intl.RelativeTimeFormat("en", {
            localeMatcher: "best fit",
            numeric: "auto",
        });

        let relativeDateString = '';
        if (absDateDiff >= day) {
            relativeDateString = rtf.format(Math.floor(dateDiff / day), 'day');
        } else if (absDateDiff >= hour) {
            relativeDateString = rtf.format(Math.floor(dateDiff / hour), 'hour');
        } else if (absDateDiff >= minute) {
            relativeDateString = rtf.format(Math.floor(dateDiff / minute), 'minute');
        } else {
            relativeDateString = rtf.format(Math.floor(dateDiff / second), 'second');
        }

        return relativeDateString;
    }

    const [relativeDateString, setRelativeDateString] = useState<string>(getRelativeDateString());

    useEffect(() => {
        const onVisibilityChange  = () => {
            if (document.visibilityState === 'visible') {
                setRelativeDateString(getRelativeDateString());
            }
        }

        window.addEventListener('visibilitychange', onVisibilityChange);

        // Clean up event listener on unmount
        return () => {
            window.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    useEffect(() => {
        setRelativeDateString(getRelativeDateString());
    }, [props.latestObservation]);

    return (<h2 className={style.title}>{props.latestObservation.formatValue()} as of {relativeDateString}</h2>);
}