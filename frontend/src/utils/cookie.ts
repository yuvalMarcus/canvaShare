export const setCookie = (name:string, value: string, exdays: number) => {
    const date = new Date();
    date.setTime(date.getTime() + (exdays*24*60*60*1000));
    const expires = `expires=${date.toUTCString()}`;

    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

export const getCookie = (cname: string) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

export const removeCookie = (name:string) => {
    const date = new Date(0);
    const expires = `expires=${date.toUTCString()}`;

    document.cookie = `${name}=; ${expires}; path=/`;
}
