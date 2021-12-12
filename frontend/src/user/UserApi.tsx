import axios from "axios";
import { getLogger } from "../core";
import { getToken } from "../core/token-helper";
import { LoginUser } from "./User";

const log = getLogger("itemApi");

const baseUrl = "localhost:5001";
const userUrl = `https://${baseUrl}/api/users`;

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

const config = {
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    },
};

export const login: (user: LoginUser) => Promise<string> = (user) => {
    return withLogs(axios.post(`${userUrl}/login`, user, config), "login");
};
