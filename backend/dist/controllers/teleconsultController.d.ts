import type { Request, Response, NextFunction } from 'express';
export interface SignalingMessage {
    id: string;
    sessionId: string;
    senderRole: 'patient' | 'doctor';
    type: 'offer' | 'answer' | 'candidate' | 'ice' | 'presence' | 'live' | 'leave';
    payload: any;
    timestamp: number;
}
export interface SessionPresence {
    sessionId: string;
    appointmentId?: string;
    patientJoined: boolean;
    doctorJoined: boolean;
    patientJoinedAt?: number;
    doctorJoinedAt?: number;
    connectedAt?: number;
    endedAt?: number;
    status: 'UPCOMING' | 'WAITING_FOR_PATIENT' | 'WAITING_FOR_DOCTOR' | 'CONNECTING' | 'LIVE' | 'ENDED' | 'FAILED';
    durationSeconds: number;
}
export declare const sessionPresenceStore: Map<string, SessionPresence>;
/**
 * Resolves appointment ID, teleconsultation ID, or token to canonical session ID ('tele-001')
 */
export declare function resolveCanonicalSessionId(id: string): string;
export interface TransitionContext {
    sessionId: string;
    to: 'UPCOMING' | 'WAITING_FOR_PATIENT' | 'WAITING_FOR_DOCTOR' | 'CONNECTING' | 'LIVE' | 'ENDED' | 'FAILED';
    role?: string;
    endpoint: string;
    reason: string;
    actor: string;
    requestId?: string;
    explicitUserAction?: boolean;
}
export declare function transitionTeleconsultationState(ctx: TransitionContext): boolean;
export declare const getTeleconsultations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeleconsultById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTeleconsultSession: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const joinTeleconsult: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const liveTeleconsult: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const leaveTeleconsult: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendSignal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSignals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clearSignals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const patchTeleconsult: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Dynamic ICE/STUN/TURN Configuration Endpoint
 * Resolves reliable STUN endpoints and dynamic/env-configured TURN servers.
 * Excludes any broken or untrusted openrelay endpoints.
 */
export declare const getIceServersConfig: (req: Request, res: Response) => Promise<void>;
