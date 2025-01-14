import {urlToFile} from "../utils/upload.ts";
import {useMutation} from "@tanstack/react-query";
import * as api from "../api/upload.ts";
import {toast} from "react-toastify";

export const useUpload = () => {

    const { mutateAsync, isPending} = useMutation({
        mutationFn: api.uploadFile,
        onSuccess: () => {},
        onError: (e) => {
            let error_msg;
            if (e?.status == 422){
                error_msg = `Invalid file`;
            }
            else
                error_msg = e?.response?.data?.detail;
            toast.error(error_msg, {autoClose: 5000});
        }
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