export interface CanvasPayload {
    name: string | null;
    description: string | null;
    data: Object | null;
    tags: string[] | [];
    is_public: boolean;
    photo: string | null;
}