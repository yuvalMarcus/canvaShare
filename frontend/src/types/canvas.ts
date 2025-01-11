export interface CanvasPayload {
    name: string | null;
    description: string | null;
    data: Object | null;
    tags: string[] | null;
    isPublic: boolean;
    photo: string | null;
}

export interface canvasTable {
    id: number
    username: string
    photo: string
    name: string
    isPublic: boolean
    likes: number
    createDate: number
    editDate: number
    description: string
}