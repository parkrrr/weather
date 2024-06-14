import React from 'preact/compat';
import { Header } from './components/Header';
import { Subheader } from './components/Subheader';
import { Chart } from './components/Chart';
import { Navigation } from './components/Navigation';
import { useEffect, useState } from 'preact/hooks';
import { View, getViewByName } from './model/View';
import { Observation } from './spec/weather-gov-api';
import { ObservationViewModel, ViewModelGenericTypes } from './model/Model';
import { Loading } from './components/Loading';
import { ErrorMessage } from './components/ErrorMessage';
import './style.scss';
import { Scale } from './components/Scale';
import { getObservations } from './services/WeatherService';

export function App() {
	const [airport, setAirport] = useState<string | null>(null);
	const [observations, setObservations] = useState<Observation[]>([]);
	const [viewModels, setViewModels] = useState<ObservationViewModel<ViewModelGenericTypes>[]>([]);
	const [view, setView] = useState<View | null>(getViewByName(localStorage.getItem('view') ?? 'Pressure'));
	const [scale, setScale] = useState<string>(localStorage.getItem('scale') ?? '3');
	const [loading, setLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
			.then((obs) => {
				if (obs.length == 0) {
					setErrorMessage(`No observations from ${airport}`);
					return;
				}

				setObservations(obs);
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

	if (loading) {
		return <Loading />
	} else if (errorMessage) {
		return <ErrorMessage message={errorMessage} onAirportChange={(a) => changeAirport(a)} />
	} else if (airport == null) {
		return <ErrorMessage message="No airport selected" onAirportChange={(a) => changeAirport(a)} />
	} else if (view == null) {
		return <ErrorMessage message="Invalid view selected" onAirportChange={(a) => changeAirport(a)} />
	} else {
		return (
			<>
				<Header latestObservation={viewModels[0]} now={new Date()} />
				<Subheader latestObservation={viewModels[0]} stationId={airport} onStationIdChanged={(a) => changeAirport(a)} />
				<Chart view={view} observations={viewModels} />
				<Navigation initialView={view} onChange={(v) => setView(v)} />
				<Scale initialScale={scale} onChange={(s) => setScale(s)} />
			</>
		);
	}
}
