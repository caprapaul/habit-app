import { Storage } from "@capacitor/storage";

const KEY_TOKEN = "token";

export const setToken = async (token: string) =>
    await Storage.set({ key: KEY_TOKEN, value: token });

export const getToken = async () =>
    (await Storage.get({ key: KEY_TOKEN })).value ?? "";

export const clearToken = async () => await Storage.remove({ key: KEY_TOKEN });
