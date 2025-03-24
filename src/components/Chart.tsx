/* eslint-disable react/no-unknown-property */
import { ObservationViewModel, ViewModelGenericTypes } from '../model/Model';
import { View } from '../model/View';
import style from './Chart.module.scss'
import React from 'preact/compat';
import { ErrorMessage } from './ErrorMessage';

export function Chart(props: { view: View, observations: ObservationViewModel<ViewModelGenericTypes>[] }) {
  if (props.observations.length == 0) {
    return <ErrorMessage message="No data" onAirportChange={() => { }} />
  }

  const labelOffset = 15;
  const pointSize = 0.25;
  const gridLineCount = 10;
  
  // wind-specific
  const trianglePointiness = 2;
  const triangleSize = 1.0;

  // find the minimum and maximum value for the data being shown
  let minimumValue = Math.min(...props.observations.map(o => o.toDataPoint().y));
  let maximumValue = Math.max(...props.observations.map(o => o.toDataPoint().y));

  // the reference value allows a specific value to always be visible
  // this is used for the pressure view to always show 29.92 to maintain the scale
  const referenceValue = props.view.referenceValue();
  if (referenceValue) {
    minimumValue = Math.min(referenceValue, minimumValue);
    maximumValue = Math.max(referenceValue, maximumValue);
  }

  // find the minimum and maximum timestamps for the data being shown
  const minimumTimestamp = Math.min(...props.observations.map(o => o.toDataPoint().x.getTime()));
  const maximumTimestamp = Math.max(...props.observations.map(o => o.toDataPoint().x.getTime()));

  // generate evenly-spaced values between two values
  // this is used to generate scale labels
  function getRange(minimum: number, maximum: number, count: number) {
    const spacing = (maximum - minimum) / (count - 1);
    return Array.from({ length: count }, (_, i) => spacing * i + minimum);
  }

  const gridLinesRange = getRange(minimumValue, maximumValue, gridLineCount);
  const dateLinesRange = getRange(minimumTimestamp, maximumTimestamp, gridLineCount).map(o => new Date(o));

  const verticalGridLines = gridLinesRange.map((_, i) => {
    const x = ((i / (gridLineCount - 1)) * (100 - labelOffset)) + labelOffset;
    return { x1: x, y1: 0, x2: x, y2: 100 };
  });

  const horizontalGridLines = gridLinesRange.map((o, i) => {
    const y = ((i / (gridLineCount - 1)) * 100);
    return { x1: 0 + labelOffset, y1: y, x2: 100, y2: y };
  });

  const yAxisLabels = gridLinesRange.sort((a, b) => b - a).map((o, i) => {
    const y = ((i / (gridLineCount - 1)) * 100);
    return y;
  });

  const xAxisLabels = dateLinesRange.sort((a, b) => a.getTime() - b.getTime()).map((o, i) => {
    const x = ((i / (gridLineCount - 1)) * (100 - labelOffset)) + labelOffset;
    return x;
  });

  const points = props.observations.map(o => {
    const point = o.toDataPoint();

    // normalize the point on the graph
    // it's important to map against the timestamp appropriately -- sometimes the data contains big gaps in time
    const x = ((point.x.getTime() - minimumTimestamp) / (maximumTimestamp - minimumTimestamp)) * (100 - labelOffset) + labelOffset;
    const y = 100 - ((point.y - minimumValue) / (maximumValue - minimumValue)) * 100;
    const qc = o.hasPassedQualityControl;

    // used to display wind data, which has a directional component as well
    const hasAdditionalValue = Object.keys(o.value).length > 1;
    return { x, y, qc, hasAdditionalValue, value: o.value };
  });

  const pathCommands = `M ${points[0].x} ${points[0].y} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}`;

  const valueFormatter = props.view.valueAxisFormatter;
  const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // rotate a triangle around a point
  // it's easier to translate the svg points than deal with the rotate transform
  const rotatePoint = (ref: { x: number, y: number }, point: { x: number, y: number }, degree: number): { x: number, y: number } => {
    // the wind data indicates where the wind is coming from, but we want to visualize where it's going
    // so we need to take `degree` and find its opposite
    const angle = (((degree + 180) % 360) * Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rotateX = (x: number, y: number) => ref.x + (x - ref.x) * cos - (y - ref.y) * sin;
    const rotateY = (x: number, y: number) => ref.y + (x - ref.x) * sin + (y - ref.y) * cos;

    const rotatedPoint = { x: rotateX(point.x, point.y), y: rotateY(point.x, point.y) };

    return rotatedPoint;
  }

  return (
    <svg id="chart" className={style.chart} viewBox="0 -5 105 130" xmlns="http://www.w3.org/2000/svg">
      <g id="gridlines">
        {verticalGridLines.map((p,i) => <line key={i} className={style.gridline} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke-dasharray="1 1" />)}
        {horizontalGridLines.map((p,i) => <line key={i} className={style.gridline} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke-dasharray="1 1" />)}
      </g>
      <g id="labels">
        {yAxisLabels.map((y, i) => <text key={i} x={0} y={y} className={style['label-y']}>{valueFormatter(gridLinesRange[i])}</text>)}
        {xAxisLabels.map((x, i) =>
          <foreignObject key={i} x={x - 1} y={101} style="overflow: visible;">
            <span className={style['label-x']}>{dateFormatter.format(dateLinesRange[i])}</span>
          </foreignObject>
        )}
      </g>
      <g id="datapoints" className={style.line}>
        <path d={pathCommands} fill="transparent" stroke-width="0.5" fill-opacity="0.5" />


        {points.map((p,i) => {
          // for now this indicates we are displaying wind data
          if (p.hasAdditionalValue) {
            // Don't render a point if the wind is calm
            if (p.value[0] == 0 && p.value[1] == 0) {
              return null;
            }

            const ref = { x: p.x, y: p.y };
            const p1 = { x: p.x, y: p.y - (trianglePointiness * triangleSize) };
            const p2 = { x: p.x + triangleSize, y: p.y + triangleSize };
            const p3 = { x: p.x - triangleSize, y: p.y + triangleSize };

            const rotatedPoints = [ref, p1, p2, p3, p1].map(r => rotatePoint(ref, r, p.value[1]))
            const pointCommands = rotatedPoints.map(p => `${p.x} ${p.y}`).join(',');

            return <polygon key={i} className={style.windpoint} points={pointCommands} />
          }

          switch (p.qc) {
            case true:
              return <circle cx={p.x} cy={p.y} r={pointSize} className={style.point} />
            case false:
              return <circle cx={p.x} cy={p.y} r={pointSize} className={style['qc-fail']} />
            case null:
            default:
              return null
          }
        })}

      </g>
    </svg>
  );

}