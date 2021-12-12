import React, { useContext, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
    CreateAnimation,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonLabel,
    IonList,
    IonLoading,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { add } from "ionicons/icons";
import Item from "./Item";
import { getLogger } from "../core";
import { ItemContext } from "./ItemProvider";
import { setToken } from "../core/token-helper";
import { Network } from "@capacitor/network";

const log = getLogger("ItemList");

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
    const { items, fetching, fetchingError, nextItems, search } =
        useContext(ItemContext);
    const [networkStatus, setNetworkStatus] = useState("Online");
    const [searchText, setSearchText] = useState("");
    const [disableInfiniteScroll, setDisableInfiniteScroll] =
        useState<boolean>(false);

    Network.addListener("networkStatusChange", (status) => {
        if (networkStatus == "Offline" && status.connected) {
            window.location.reload();
        }

        setNetworkStatus(status.connected ? "Online" : "Offline");
    });

    const handleNext = ($event: CustomEvent<void>) => {
        nextItems &&
            nextItems(searchText).then(() =>
                ($event.target as HTMLIonInfiniteScrollElement).complete()
            );
    };

    const handleSearch = (text: string) => {
        setSearchText(text);
        search && search(text);
    };

    log("render");
    log(items);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle slot="start">Notes App</IonTitle>
                    <IonLabel slot="start">{networkStatus}</IonLabel>
                    <IonButton
                        slot="end"
                        color="primary"
                        onClick={async () => {
                            await setToken("");
                            history.push("/login");
                        }}
                    >
                        Logout
                    </IonButton>
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar
                        debounce={500}
                        value={searchText}
                        onIonChange={(e) => handleSearch(e.detail.value!)}
                    ></IonSearchbar>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items" />
                {items && (
                    <IonList>
                        {items.map(({ id, title, text, updatedAt, image }) => (
                            <Item
                                key={id}
                                id={id}
                                title={title}
                                text={text}
                                updatedAt={updatedAt}
                                image={image}
                                onEdit={(id) => history.push(`/item/${id}`)}
                            />
                        ))}
                    </IonList>
                )}
                <IonInfiniteScroll
                    threshold="20%"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => handleNext(e)}
                >
                    <IonInfiniteScrollContent loadingText="Loading more notes..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>
                        {fetchingError.message || "Failed to fetch items"}
                    </div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push("/item")}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
