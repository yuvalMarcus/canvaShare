export interface ReportPayload {
    id?: number;
    date?: number;
    type: 'artist' | 'paint';
    userId?: number;
    paintId?: number;
    description: string;
}