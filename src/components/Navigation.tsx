import React from 'preact/compat';
import { useState } from "preact/hooks";
import { View, views } from "../model/View";
import style from './Navigation.module.scss';

export function Navigation(props: { initialView: View, onChange: (view: View) => void }) {
    const [activeView, setActiveView] = useState(props.initialView);

    const setView = (view: View) => {
        setActiveView(view);
        props.onChange(view);
    }

    const navItems = views.map((view, i) => {
        return (<li key={i} value={view.name} className={`${style.view} ${activeView == view ? style.active : ''}`} onClick={() => setView(view)}>{view.name}</li>);
    });

    return (
        <div className={style['view-container']}>
            <ul id="navigation">
                {navItems}
            </ul>
        </div>
    )
}