import {ReportType} from "../components/ReportModal/ReportModal.config.ts";

export interface ReportPayload {
    type: ReportType;
    userId: number;
    paintId?: number;
    description: string;
}