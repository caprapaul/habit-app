export interface LoginUser {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export const EMPTY_LOGIN_USER: LoginUser = {
    email: "",
    password: "",
};
