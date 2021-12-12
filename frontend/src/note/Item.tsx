import React from "react";
import {
    CreateAnimation,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCheckbox,
    IonImg,
    IonItem,
    IonLabel,
} from "@ionic/react";
import { ItemProps } from "./ItemProps";

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({
    id,
    title,
    text,
    updatedAt,
    image,
    onEdit,
}) => {
    return (
        <CreateAnimation
            duration={200}
            fromTo={[
                {
                    property: "transform",
                    fromValue: "translate(-100px, 0)",
                    toValue: "translate(0, 0)",
                },
                {
                    property: "opacity",
                    fromValue: "0.2",
                    toValue: "1",
                },
            ]}
            play={true}
        >
            <IonCard button onClick={() => onEdit(id)}>
                <IonImg src={image ?? ""} />
                <IonCardHeader>
                    <IonCardSubtitle>
                        <small>
                            {updatedAt?.toLocaleString([], {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                            }) ?? ""}
                        </small>
                    </IonCardSubtitle>
                    <IonCardTitle>{title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{text}</IonCardContent>
                <br />
            </IonCard>
        </CreateAnimation>
    );
};

export default Item;
