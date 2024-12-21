import {urlToFile} from "../utils/upload.ts";
import {useMutation} from "@tanstack/react-query";
import * as api from "../api/upload.ts";

export const useUpload = () => {

    const { mutateAsync, isSuccess, isPending, isError, isPaused, isIdle } = useMutation({
        mutationFn: api.uploadFile,
        onSuccess: () => {},
        onError: () => {}
    })

    const upload = async (photo: string, filename: string, mimeType: string) => {
        const file = await urlToFile(photo, filename, mimeType);
        return await mutateAsync(file);
    }

    return {
        upload
    }
}