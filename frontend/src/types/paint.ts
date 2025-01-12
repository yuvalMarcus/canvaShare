export interface PaintPayload {
    name: string | null;
    description: string | null;
    data: Object | null;
    tags: string[] | null;
    isPublic: boolean;
    photo: string | null;
}

export interface paintTable {
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