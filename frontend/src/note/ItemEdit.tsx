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
    IonBackButton,
    IonTextarea,
    IonItemDivider,
    IonFab,
    IonFabButton,
    IonIcon,
    IonImg,
    IonNote,
    IonItemGroup,
} from "@ionic/react";
import { getLogger } from "../core";
import { ItemContext } from "./ItemProvider";
import { RouteComponentProps } from "react-router";
import { ItemProps } from "./ItemProps";
import { camera } from "ionicons/icons";
import {
    pathFromBase64,
    usePhotoGallery,
    UserPhoto,
} from "../core/usePhotoGallery";

const log = getLogger("ItemEdit");

interface ItemEditProps
    extends RouteComponentProps<{
        id?: string;
    }> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
    const { items, saving, savingError, saveItem } = useContext(ItemContext);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [image, setImage] = useState("");

    const [item, setItem] = useState<ItemProps>();
    const { takePhoto } = usePhotoGallery();

    useEffect(() => {
        log("useEffect");
        const routeId = match.params.id || "";
        const item = items?.find((it) => it.id == routeId);
        log(routeId);

        setItem(item);

        if (item) {
            item.title && setTitle(item.title);
            item.image && setImage(item.image);
            setText(item.text);
        }
    }, [match.params.id, items]);

    const handlePhoto = async () => {
        const photo = await takePhoto();
        setImage(photo);
    };

    const handleSave = () => {
        const editedItem = item
            ? { ...item, title, text, image }
            : { title, text, image };
        log(
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        );
        log(editedItem);
        saveItem && saveItem(editedItem).then(() => history.goBack());
    };

    log("render");
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton />
                    </IonButtons>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>Save</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel position="floating">Title</IonLabel>
                    <IonInput
                        value={title}
                        onIonChange={(e) => setTitle(e.detail.value!)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="floating">Text</IonLabel>
                    <IonTextarea
                        autoGrow={true}
                        value={text}
                        onIonChange={(e) => setText(e.detail.value!)}
                    />
                </IonItem>
                <IonItem button onClick={() => setImage("")}>
                    <IonImg src={image ?? ""} />
                </IonItem>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => handlePhoto()}>
                        <IonIcon icon={camera}></IonIcon>
                    </IonFabButton>
                </IonFab>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || "Failed to save item"}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ItemEdit;
