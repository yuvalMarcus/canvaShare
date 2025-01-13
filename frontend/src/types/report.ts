export interface ReportPayload {
    id?: number;
    date?: number;
    type: 'artist' | 'canvas';
    userId?: number;
    canvasId?: number;
    description: string;
}