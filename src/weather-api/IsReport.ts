import { Observation } from "./weather-gov-api";

/**
 * Returns whether or not the observation is a METAR report 
 */
export const isReport = (observation: Observation): Boolean => {
    return observation.rawMessage != undefined && observation.rawMessage != "";
}