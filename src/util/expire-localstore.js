
export const localStorageSet = (name, data, timeDay) => {
    const obj = {
        data,
        expire: new Date().getTime() + timeDay * 24 * 60 * 60 * 1000
    };
    localStorage.setItem(name, JSON.stringify(obj));
};

export const localStorageGet = name => {
    const storage = localStorage.getItem(name);
    const time = new Date().getTime();
    let result = null;
    if (storage) {
        const obj = JSON.parse(storage);
        if (time < obj.expire) {
            result = obj.data;
        } else {
            localStorage.removeItem(name);
        }
    }
    return result;
};
