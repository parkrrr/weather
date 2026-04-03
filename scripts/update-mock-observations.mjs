import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATION_ID = 'KTYQ';
const DAYS_BACK = 5;
const USER_AGENT = 'https://github.com/parkrrr/weather';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '..', 'src', 'tests', 'mockObservations.ts');

const startDate = new Date();
startDate.setDate(startDate.getDate() - DAYS_BACK);

const url = `https://api.weather.gov/stations/${STATION_ID}/observations?start=${startDate.toISOString()}`;

console.log(`Fetching observations from ${url}`);

const resp = await fetch(url, {
    headers: {
        'Accept': 'application/geo+json',
        'User-Agent': USER_AGENT,
    },
});

if (!resp.ok) {
    console.error(`API request failed: ${resp.status} ${resp.statusText}`);
    process.exit(1);
}

const data = await resp.json();
data.mock = true;

const fileContent = `import { MockObservationStationCollection } from "./MockObservationStationCollection";

const mockObservations: MockObservationStationCollection = ${JSON.stringify(data, null, 4)}

export default mockObservations;
`;

writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`Updated ${outputPath}`);
