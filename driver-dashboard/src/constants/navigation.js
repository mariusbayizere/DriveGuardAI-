/**
 * constants/navigation.js
 * Single source of truth for nav items and valid shell routes.
 * Update here and the entire app reflects the change automatically.
 */
import { Icons } from '../components/icons/Icons';

export const NAV_ITEMS = [
  { path: '/',                     Icon: Icons.Dashboard,  label: 'Dashboard'       },
  { path: '/drivers-management',   Icon: Icons.Drivers,    label: 'Drivers'         },
  { path: '/vehicles-management',  Icon: Icons.Vehicles,   label: 'Vehicles'        },
  { path: '/trips-management',     Icon: Icons.Trips,      label: 'Trips'           },
  { path: '/incidents-management', Icon: Icons.Incidents,  label: 'Incidents'       },
  { path: '/alerts-management',    Icon: Icons.Alerts,     label: 'Alerts'          },
  { path: '/reports',              Icon: Icons.Reports,    label: 'Reports'         },
  { path: '/monitoring',           Icon: Icons.Monitoring, label: 'Live Monitoring' },
  { path: '/users',                Icon: Icons.Users,      label: 'Users'           },
];

/** All paths that render inside the authenticated AppShell */
export const SHELL_PATHS = [
  '/', '/drivers', '/drivers-management', '/vehicles-management',
  '/trips-management', '/incidents-management', '/reports',
  '/alerts-management', '/users', '/trips', '/violations', '/monitoring',
];

/** Maps pathname → topbar title + subtitle */
export const PAGE_META = {
  '/':                     { title: 'Dashboard',          sub: 'Fleet safety overview'    },
  '/drivers':              { title: 'Drivers',            sub: 'Driver roster list'        },
  '/drivers-management':   { title: 'Drivers Management', sub: 'Manage driver accounts'   },
  '/vehicles-management':  { title: 'Vehicles',           sub: 'Fleet vehicle registry'   },
  '/trips-management':     { title: 'Trips',              sub: 'Manage all trips'          },
  '/incidents-management': { title: 'Incidents',          sub: 'Safety incident tracking' },
  '/reports':              { title: 'Incident Reports',   sub: 'Analytics & reporting'    },
  '/alerts-management':    { title: 'Alerts',             sub: 'System alert management'  },
  '/users':                { title: 'Users',              sub: 'User account management'  },
  '/trips':                { title: 'Trips (List)',        sub: 'View all trips'           },
  '/violations':           { title: 'Violations',         sub: 'Driver violations log'    },
  '/monitoring':           { title: 'Live Monitoring',    sub: 'Real-time video feed'     },
};
