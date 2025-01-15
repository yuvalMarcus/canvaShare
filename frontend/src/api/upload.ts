import instance from "../server/axios.ts";

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return await instance.post('photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
}
