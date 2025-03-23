import React from 'preact/compat';
import { useState } from "preact/hooks";
import style from './Navigation.module.scss';

export function Scale(props: { initialScale: string, onChange: (scale: string) => void }) {
    const [activeScale, setActiveScale] = useState(props.initialScale);

    const setScale = (scale: string) => {
        setActiveScale(scale);
        props.onChange(scale);
    }

    const scales = ['1', '3', '5'];

    const navItems = scales.map((scale, i) => {
        return (<div key={i} value={scale} className={`${style.view} ${activeScale == scale ? style.active : ''}`} onClick={() => setScale(scale)}>{scale} day</div>);
    });

    return (
        <div className={style['view-container']}>
            {navItems}
        </div>
    )
}