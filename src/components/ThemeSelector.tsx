import React from 'preact/compat';
import { useState } from "preact/hooks";
import style from './Navigation.module.scss';

export function Theme(props: { initialTheme: string, onChange: (theme: string) => void }) {
    const [activeTheme, setActiveTheme] = useState(props.initialTheme);

    const setTheme = (theme: string) => {
        setActiveTheme(theme);
        props.onChange(theme);
    }

    const themes = ['Light', 'Dark', 'OLED', 'Win95'];

    const navItems = themes.map((theme, i) => {
        return (<div key={i} className={`${style.view} ${activeTheme == theme.toLowerCase() ? style.active : ''}`} onClick={() => setTheme(theme.toLowerCase())}>{theme}</div>);
    });

    return (
        <div id="theme" className={style['view-container']}>
            {navItems}
        </div>
    )
}