import { UserPhoto } from "../core/usePhotoGallery";

export interface ItemProps {
    id?: string;
    title?: string;
    text: string;
    addedAt?: Date;
    updatedAt?: Date;
    image?: string;
}
