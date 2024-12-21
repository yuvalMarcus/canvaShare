
export const urlToFile = async (url, filename, mimeType) => {
    if (url.startsWith('data:')) {

        const arr = url.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]);

        let n = bstr.length;
        const u8arr = new Uint8Array(n)

        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

        const file = new File([u8arr], filename, {type:mime || mimeType});

        return Promise.resolve(file);
    }

    return fetch(url)
        .then(res => res.arrayBuffer())
        .then(buf => new File([buf], filename,{type:mimeType}));
}