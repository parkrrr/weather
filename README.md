# Weather

## About
I wrote this to fill a need to quickly view recent historical trends regarding the weather. Originally the focus of the application was to view barometric pressure but was expanded to include other metrics. It started as a convoluted, AWS-hosted contraption to work on my AWS skills. This quickly got tedious and I converted it to use the NWS weather API directly.

### Milestones
* Winter 2021 - First UI iteration using Knockout.js and Chart.js. Would only display barometric pressure.
* Summer 2021 - Converted graph to Chartist, added temperature and humidity views.
* Winter 2022 - Removed jQuery and Moment dependencies, added dewpoint view. Removed server components and query NWS API directly.
* Fall 2023 - Converted to Preact, moved to GitHub Pages.
* Spring 2024 - Chartist dependency removed, now rendering SVG directly. Added wind view and time scale controls.
* Sprint 2025 - Added location API to auto-locate stations.

## Usage
Load https://parkrrr.github.io/weather/ into your mobile browser of choice. The design is mobile-first so it may be weird to use on a desktop.

Click the location icon next to the station code to auto-locate. If location permission is denied you will be prompted to enter a station code (such as an airport).

Not all stations report the same data. Some data points may not be available depending on the station that was found.

Observations that have failed quality control will be rendered with a darker point. Initial observations that have not undergone quality control will not render a point, but will still have a connecting line.

## Data
This application uses data provided by the [National Weather Service](https://www.weather.gov/documentation/services-web-api). As a result, data is limited to areas monitored by the United States government.

The types for the NWS API can be re-generated using `npm run generate`.

## Tests
There is a growing suite of tests, utilizing Playwright. The site must be built before testing: `npm run build` then `npm test`.

## Preview
![image](https://github.com/user-attachments/assets/10193100-908f-4115-ac22-accbe4ad37c1)


