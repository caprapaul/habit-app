import React, { useCallback, useEffect, useReducer, useState } from "react";
import PropTypes from "prop-types";
import { getLogger } from "../core";
import { ItemProps } from "./ItemProps";
import { createItem, getItems, newWebSocket, updateItem } from "./ItemApi";
import { usePhotoGallery } from "../core/usePhotoGallery";

const log = getLogger("ItemProvider");

type SaveItemFn = (item: ItemProps) => Promise<any>;
type NextItemsFn = (text: string) => Promise<any>;
type SearchFn = (text: string) => void;

export interface ItemsState {
    items?: ItemProps[];
    fetching: boolean;
    fetchingError?: Error | null;
    saving: boolean;
    savingError?: Error | null;
    saveItem?: SaveItemFn;
    nextItems?: NextItemsFn;
    searchText?: string;
    search?: SearchFn;
}

interface ActionProps {
    type: string;
    payload?: any;
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
};

const FETCH_ITEMS_STARTED = "FETCH_ITEMS_STARTED";
const FETCH_ITEMS_SUCCEEDED = "FETCH_ITEMS_SUCCEEDED";
const FETCH_MORE_ITEMS_SUCCEEDED = "FETCH_MORE_ITEMS_SUCCEEDED";
const FETCH_ITEMS_FAILED = "FETCH_ITEMS_FAILED";
const SAVE_ITEM_STARTED = "SAVE_ITEM_STARTED";
const SAVE_ITEM_SUCCEEDED = "SAVE_ITEM_SUCCEEDED";
const SAVE_ITEM_FAILED = "SAVE_ITEM_FAILED";

const reducer: (state: ItemsState, action: ActionProps) => ItemsState = (
    state,
    { type, payload }
) => {
    switch (type) {
        case FETCH_ITEMS_STARTED:
            return { ...state, fetching: true, fetchingError: null };

        case FETCH_ITEMS_SUCCEEDED:
            return { ...state, items: payload.items, fetching: false };

        case FETCH_MORE_ITEMS_SUCCEEDED:
            const payloadItems = [...(state.items || [])];
            payloadItems.push(...payload.items);

            return { ...state, items: payloadItems, fetching: false };

        case FETCH_ITEMS_FAILED:
            return { ...state, fetchingError: payload.error, fetching: false };

        case SAVE_ITEM_STARTED:
            return { ...state, savingError: null, saving: true };

        case SAVE_ITEM_SUCCEEDED:
            const items = [...(state.items || [])];
            const item = payload.item;
            const index = items.findIndex((it) => it.id === item.id);

            if (!item) {
                return { ...state, items, saving: false };
            }

            if (index === -1) {
                items.unshift(item);
            } else {
                items.splice(index, 1);
                items.unshift(item);
            }
            return { ...state, items, saving: false };

        case SAVE_ITEM_FAILED:
            return { ...state, savingError: payload.error, saving: false };

        default:
            return state;
    }
};

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, saving, savingError } = state;

    useEffect(() => getItemsOffset(0), []);
    useEffect(wsEffect, []);

    const value = {
        items,
        fetching,
        fetchingError,
        saving,
        savingError,
        saveItem,
        nextItems,
        search,
    };

    log("returns");

    return (
        <ItemContext.Provider value={value}>{children}</ItemContext.Provider>
    );

    function search(text: string) {
        getItemsOffset(0, text);
    }

    function getItemsOffset(offset: number, searchText: string = "") {
        let canceled = false;

        fetchItems();

        return () => {
            canceled = true;
        };

        async function fetchItems() {
            try {
                log("fetchItems started");
                dispatch({ type: FETCH_ITEMS_STARTED });
                const items = await getItems(offset, searchText);
                // loadItemsPhoto(items);
                log("fetchItems succeeded");

                if (!canceled) {
                    if (offset == 0) {
                        dispatch({
                            type: FETCH_ITEMS_SUCCEEDED,
                            payload: { items },
                        });
                    } else {
                        dispatch({
                            type: FETCH_MORE_ITEMS_SUCCEEDED,
                            payload: { items },
                        });
                    }
                }
            } catch (error) {
                log("fetchItems failed");
                dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
            }
        }
    }

    async function nextItems(searchText: string) {
        getItemsOffset(items?.length ?? 0, searchText);
    }

    async function saveItem(item: ItemProps) {
        try {
            log("saveItem started");
            dispatch({ type: SAVE_ITEM_STARTED });

            // if (item.photo) {
            //     item.image = await readPhoto(item.photo);
            // }

            const savedItem = await (item.id
                ? updateItem(item)
                : createItem(item));
            log("saveItem succeeded");

            dispatch({
                type: SAVE_ITEM_SUCCEEDED,
                payload: { item: savedItem },
            });
        } catch (error) {
            log("saveItem failed");
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let closeWebSocket: () => void;
        let canceled = false;

        async function ws() {
            closeWebSocket = await newWebSocket((message) => {
                if (canceled) {
                    return;
                }

                log(`ws message, ${JSON.stringify(message)}`);

                const {
                    event,
                    payload: { item },
                } = message;
                log(`ws message, event ${event}`);
                log(`ws message, item ${item}`);
                log(message.payload);

                if (event === "created" || event === "updated") {
                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
                }
            });
        }
        ws();
        log("wsEffect - connecting");

        return () => {
            log("wsEffect - disconnecting");
            canceled = true;
            closeWebSocket();
        };
    }
};
