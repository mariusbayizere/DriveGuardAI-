import {
  IcoDistraction,
  IcoSpeeding,
  IcoSeatbelt,
  IcoPhone,
  IcoFatigue,
  IcoGeneric,
} from '../DashboardComponents/icons';

/**
 * Maps an incident type string to its corresponding icon component.
 * Falls back to IcoGeneric for unrecognised types.
 *
 * @param {string} type - Raw incident_type value from the API
 * @returns {React.ComponentType} Icon component
 */
export const getIncidentIcon = (type = '') => {
  const t = type.toUpperCase();
  if (t.includes('DISTRACT'))                        return IcoDistraction;
  if (t.includes('SPEED'))                           return IcoSpeeding;
  if (t.includes('SEATBELT') || t.includes('BELT')) return IcoSeatbelt;
  if (t.includes('PHONE')    || t.includes('MOBILE'))return IcoPhone;
  if (t.includes('FATIGUE')  || t.includes('SLEEP')) return IcoFatigue;
  return IcoGeneric;
};
