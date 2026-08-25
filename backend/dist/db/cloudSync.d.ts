import type { AppointmentEntity } from '../types/index.js';
import type { DataStore } from './store.js';
export declare function publishCloudAppointment(apt: AppointmentEntity): Promise<void>;
export declare function syncCloudAppointments(store: DataStore): Promise<void>;
