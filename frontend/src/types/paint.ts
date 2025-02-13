export interface PaintPayload {
    name: string | null;
    description: string | null;
    data: Object | null;
    tags: string[] | null;
    isPublic: boolean;
    photo: string | null;
}