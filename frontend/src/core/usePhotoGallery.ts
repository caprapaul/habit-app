import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";

import {
    Camera,
    CameraResultType,
    CameraSource,
    Photo,
} from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Storage } from "@capacitor/storage";
import { Capacitor } from "@capacitor/core";
import { getLogger } from ".";

const log = getLogger("usePhotoGallery");

export interface UserPhoto {
    filePath: string;
    webviewPath?: string;
}

export function usePhotoGallery() {
    const savePhoto = async (photoBase64: string): Promise<UserPhoto> => {
        const fileName = new Date().getTime() + ".jpeg";
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: photoBase64,
            directory: Directory.Data,
        });

        return {
            filePath: fileName,
            webviewPath: `data:image/jpeg;base64,${photoBase64}`,
        };
    };

    const takePhoto: () => Promise<string> = async () => {
        try {
            const cameraPhoto = await Camera.getPhoto({
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                quality: 60,
            });

            const base64Data = await base64FromPath(cameraPhoto.webPath!);
            const savedPhoto = await savePhoto(base64Data);
            log(base64Data);

            return base64Data;
        } catch (e) {
            log("cancelled photo");
            return "";
        }
    };

    const readPhoto: (photo: UserPhoto) => Promise<string> = async (photo) => {
        const file = await Filesystem.readFile({
            path: photo.filePath,
            directory: Directory.Data,
        });

        return file.data;
    };

    return {
        takePhoto,
        readPhoto,
        savePhoto,
    };
}

export function pathFromBase64(base64: string): string {
    return `data:image/jpeg;base64,${base64}`;
}

export async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject("method did not return a string");
            }
        };
        reader.readAsDataURL(blob);
    });
}
