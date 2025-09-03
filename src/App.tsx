import React from 'preact/compat';
import { Header } from './components/Header';
import { Subheader } from './components/Subheader';
import { Chart } from './components/Chart';
import { Navigation } from './components/Navigation';
import { useEffect, useState } from 'preact/hooks';
import { View, getViewByName } from './model/View';
import { Observation } from './weather-api/weather-gov-api';
import { ObservationViewModel, ViewModelGenericTypes } from './model/Model';
import { Loading } from './components/Loading';
import { ErrorMessage } from './components/ErrorMessage';
import style from './App.module.scss';
import { Scale } from './components/Scale';
import { VNode } from 'preact';
import { getObservations } from './weather-api/getObservations';

export function App() {
	const [airport, setAirport] = useState<string | null>(null);
	const [observations, setObservations] = useState<Observation[]>([]);
	const [viewModels, setViewModels] = useState<ObservationViewModel<ViewModelGenericTypes>[]>([]);
	const [view, setView] = useState<View | null>(getViewByName(localStorage.getItem('view') ?? 'Pressure'));
	const [scale, setScale] = useState<string>(localStorage.getItem('scale') ?? '3');
	const [loading, setLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isUsingMocks, setIsUsingMocks] = useState<boolean>(false);

	if (airport == null && window.location.search != '') {
		const params = new URLSearchParams(window.location.search);
		const airport = params.get('airport');
		if (airport != null) {
			setAirport(airport.toUpperCase());
		}
	}
	else if (airport == null || airport == '') {
		setAirport('KTYQ');
	}

	useEffect(() => {
		if (airport == null) {
			return;
		}

		setLoading(true);

		const refDate = new Date();
		refDate.setDate(refDate.getDate() - parseInt(scale));

		getObservations(airport, refDate)
			.then(({observations, isUsingMocks}) => {
				setIsUsingMocks(isUsingMocks);
				setObservations(observations);
			})
			.catch((err: Error) => setErrorMessage(err.message))
			.finally(() => setLoading(false));
	}, [airport, scale]);

	useEffect(() => {
		if (view == null || observations == null || observations.length == 0) {
			return;
		}

		const viewModels = observations.filter(o => view.nullCheck(o) == false).map(o => view.viewModelFactory(o));
		setViewModels(viewModels);
	}, [view, observations]);

	useEffect(() => {
		if (view != null)
			localStorage.setItem('view', view.name);
	}, [view])

	useEffect(() => {
		if (scale != null)
			localStorage.setItem('scale', scale.toString());
	}, [scale])

	const changeAirport = (airportCode: string | null) => {
		if (!airportCode) {
			return;
		}

		// update the airport and push the new param to url
		const normalizedAirportCode = airportCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
		setAirport(normalizedAirportCode);
		setErrorMessage(null);

		const searchParams = new URLSearchParams(window.location.search)
		searchParams.set("airport", normalizedAirportCode);
		const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
		history.pushState(null, '', newRelativePathQuery);
	}

	let content: VNode | string | null | undefined;

	if (loading) {
		content = <Loading />
	} else if (errorMessage) {
		content = <ErrorMessage message={errorMessage} onAirportChange={(a) => changeAirport(a)} />
	} else if (airport == null) {
		content = <ErrorMessage message="No airport selected" onAirportChange={(a) => changeAirport(a)} />
	} else if (view == null) {
		content = <ErrorMessage message="Invalid view selected" onAirportChange={(a) => changeAirport(a)} />
	} else if (observations.length == 0) {
		content = <ErrorMessage message={`No observations from ${airport}`} onAirportChange={(a) => changeAirport(a)} />
	} else {
		content = (
			<div className={style.app}>
				<Header latestObservation={viewModels[0]} now={new Date()} />
				<Subheader latestObservation={viewModels[0]} stationId={airport} onStationIdChanged={changeAirport} />
				<Chart view={view} observations={viewModels} />
				<Navigation initialView={view} onChange={(v) => setView(v)} />
				<Scale initialScale={scale} onChange={(s) => setScale(s)} />
			</div>
		);
	}

	// a mock warning is shown during tests to confirm the network request was mocked
	// this is more about preventing sending a bunch of network requests to the weather.gov API while running tests
	const mockWarning = (isUsingMocks && <div id="mockwarning">Using mock data</div>);

	return (
		<div>
			{content}
			{mockWarning}
		</div>
	);
}
