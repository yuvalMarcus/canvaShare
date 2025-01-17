import {ReportType} from "../components/ReportModal/ReportModal.config.ts";

export interface ReportPayload {
    type: ReportType;
    userId: number;
    canvasId?: number;
    description: string;
}