import { useEffect, useState } from "preact/hooks";
import { ObservationViewModel } from "../model/Model"

export function Header(props: { latestObservation: ObservationViewModel, now: Date }) {
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

    const [relativeDateString, setrelativeDateString] = useState<string>(getRelativeDateString());

    useEffect(() => {
        const onFocus = () => setrelativeDateString(getRelativeDateString());

        window.addEventListener('focus', onFocus);

        // Clean up event listener on unmount
        return () => {
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    return (<h2 class="title">{props.latestObservation.formatValue()} as of {relativeDateString}</h2>);
}