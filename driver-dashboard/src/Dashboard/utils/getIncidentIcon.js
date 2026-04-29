import { IcoDistraction, IcoSpeeding, IcoSeatbelt, IcoPhone, IcoFatigue, IcoGeneric } from '../components/icons';

export const getIncidentIcon = (type = '') => {
  const t = type.toUpperCase();
  if (t.includes('DISTRACT'))                          return IcoDistraction;
  if (t.includes('SPEED'))                             return IcoSpeeding;
  if (t.includes('SEATBELT') || t.includes('BELT'))   return IcoSeatbelt;
  if (t.includes('PHONE')    || t.includes('MOBILE'))  return IcoPhone;
  if (t.includes('FATIGUE')  || t.includes('SLEEP'))   return IcoFatigue;
  return IcoGeneric;
};
