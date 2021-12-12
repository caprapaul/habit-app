import axios from "axios";
import { getLogger } from "../core";
import { getToken } from "../core/token-helper";
import { ItemProps } from "./ItemProps";

const log = getLogger("itemApi");

const baseUrl = "localhost:5001";
const itemUrl = `https://${baseUrl}/api/notes`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(
    promise: Promise<ResponseProps<T>>,
    fnName: string
): Promise<T> {
    log(`${fnName} - started`);

    return promise
        .then((res) => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch((err) => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = async () => {
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
        },
    };
};

export const getItems: (
    offset: number,
    searchText: string
) => Promise<ItemProps[]> = async (offset, searchText) => {
    return withLogs(
        axios.get(
            `${itemUrl}?searchText=${searchText}&offset=${offset}&count=8&`,
            await config()
        ),
        "getItems"
    );
};

export const createItem: (item: ItemProps) => Promise<ItemProps[]> = async (
    item
) => {
    return withLogs(axios.post(itemUrl, item, await config()), "createItem");
};

export const updateItem: (item: ItemProps) => Promise<ItemProps[]> = async (
    item
) => {
    return withLogs(
        axios.put(`${itemUrl}`, item, await config()),
        "updateItem"
    );
};

interface MessageData {
    event: string;
    payload: {
        item: ItemProps;
    };
}

export const newWebSocket = async (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(
        `wss://${baseUrl}/api/notifications?token=${await getToken()}`
    );
    ws.onopen = () => {
        log("web socket onopen");
    };

    ws.onclose = () => {
        log("web socket onclose");
    };

    ws.onerror = (error) => {
        log("web socket onerror", error);
    };

    ws.onmessage = (messageEvent) => {
        log("web socket onmessage");
        onMessage(JSON.parse(messageEvent.data));
    };

    return () => {
        ws.close();
    };
};
