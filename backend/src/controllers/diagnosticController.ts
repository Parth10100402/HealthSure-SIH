// HealthSure — Diagnostics Controller
// backend/src/controllers/diagnosticController.ts

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/store.js';

export const getDiagnosticServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { facilityId, category, status } = req.query;

    let list = [...dataStore.diagnosticServices];

    if (facilityId) list = list.filter((d) => d.facilityId === facilityId);
    if (category) list = list.filter((d) => d.category.toLowerCase() === (category as string).toLowerCase());
    if (status) list = list.filter((d) => d.status === (status as string).toUpperCase());

    const enriched = list.map((d) => {
      const fac = dataStore.facilities.find((f) => f.id === d.facilityId);
      return {
        ...d,
        facilityName: fac?.name || 'PHC Khed',
        facilityType: fac?.type || 'PHC',
      };
    });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiagnosticReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: 'rep-01',
          testName: 'Complete Blood Count (CBC) Panel',
          category: 'Haematology',
          date: '2026-08-22',
          status: 'READY',
          facility: 'PHC Khed Lab',
          resultsSummary: 'Hb: 13.8 g/dL (Normal), WBC: 7,400 /uL, Platelets: 240,000 /uL.',
        },
        {
          id: 'rep-02',
          testName: '12-Lead Rest ECG Tracing',
          category: 'Cardiology',
          date: '2026-08-22',
          status: 'READY',
          facility: 'PHC Khed Diagnostic Desk',
          resultsSummary: 'Sinus rhythm, HR 76 bpm. ST elevation noted in V2-V4. Forwarded to DH Ratnagiri.',
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};
