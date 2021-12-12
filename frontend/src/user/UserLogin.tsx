import React, { useContext, useEffect, useState } from "react";
import {
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonItem,
} from "@ionic/react";
import { getLogger } from "../core";
import { Redirect, RouteComponentProps, useHistory } from "react-router";
import { login } from "./UserApi";
import { LoginUser } from "./User";
import { getToken, setToken } from "../core/token-helper";
import { AxiosError } from "axios";

const log = getLogger("UserLogin");

const UserLogin: React.FC<RouteComponentProps> = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const history = useHistory();
    const [localToken, setLocalToken] = useState("");

    const handleLogin = async () => {
        const loginUser: LoginUser = { email, password };
        try {
            const token: string = await login(loginUser);
            await setToken(token);
            history.push("/items");
        } catch (e) {
            const err = e as AxiosError;
            setError(err.message);
        }
    };

    useEffect(() => {
        async function getTokenFromStorage() {
            const token = await getToken();
            setLocalToken(token);
        }
        getTokenFromStorage();
    }, []);

    if (!!localToken) {
        return <Redirect to={{ pathname: "/" }} />;
    } else {
        return (
            <IonPage>
                <IonContent>
                    <IonItem>
                        <IonLabel>Email:</IonLabel>
                        <IonInput
                            value={email}
                            onIonChange={(e) => setEmail(e.detail.value || "")}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Password:</IonLabel>
                        <IonInput
                            type="password"
                            value={password}
                            onIonChange={(e) =>
                                setPassword(e.detail.value || "")
                            }
                        />
                    </IonItem>
                    <IonButton color="primary" onClick={handleLogin}>
                        Login
                    </IonButton>
                    <IonLabel>{error}</IonLabel>
                </IonContent>
            </IonPage>
        );
    }
};

export default UserLogin;
