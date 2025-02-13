import {useMutation} from "@tanstack/react-query";
import * as api from "../../upload.ts";
import {UseMutationHook} from "../../../types/general.ts";
import {urlToFile} from "../../../utils/upload.ts";

const useUpload = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending} = useMutation({
        mutationFn: api.uploadFile,
        onSuccess,
        onError
    })

    const uploadFileCode = async (photo: string, filename: string, mimeType: string) => {
        const file = await urlToFile(photo, filename, mimeType);
        return await mutateAsync(file).catch(e => {});
    }

    const upload = async (file: File) => {
        return await mutateAsync(file).catch(e => {});
    }

    return {
        uploadFileCode,
        upload,
        isPending,
    }
}

export default useUpload;