import { writable } from 'svelte/store';

export interface WebSocketListener {
    [key: string]: ((this: WebSocket, ev: Event) => any)[];
}

interface WebSocketMap {
    connections: Map<string, WebSocket>;
    statuses: Map<string, boolean>;
    listeners: Map<string, WebSocketListener>;
}

const initialState: WebSocketMap = {
    connections: new Map<string, WebSocket>(),
    statuses: new Map<string, boolean>(),
    listeners: new Map<string, WebSocketListener>(),
};

// Initialise a writeable store
export const webSocketStore = writable<WebSocketMap>(initialState);

// Function to add a new WebSocket connection
export function addWebSocketConnection(topic: string, websocket: WebSocket, listeners?: WebSocketListener) {
    webSocketStore.update(currentState => {
        currentState.connections.set(topic, websocket);
        currentState.statuses.set(topic, false); // Initialise with false
        if (listeners) {
            currentState.listeners.set(topic, listeners); // Add listeners if provided
            // Attach listeners to the WebSocket
            Object.keys(listeners).forEach((eventType) => {
                listeners[eventType].forEach((listener) => {
                    websocket.addEventListener(eventType, listener);
                });
            });
        }
        return currentState;
    });
}

// Function to remove a WebSocket connection
export function removeWebSocketConnection(topic: string) {
    webSocketStore.update(currentState => {
        const connection = currentState.connections.get(topic);
        if (connection) {
            connection.close();
            currentState.connections.delete(topic);
            currentState.statuses.delete(topic);
        }
        return currentState;
    });
}

// Function to update WebSocket connection status
export function updateWebSocketStatus(topic: string, status: boolean) {
    webSocketStore.update(currentState => {
        if (currentState.connections.has(topic)) {
            currentState.statuses.set(topic, status);
        }
        return currentState;
    });
}

// Function to add event listeners to an existing WebSocket connection
export function addWebSocketListener(topic: string, eventType: string, listener: EventListener) {
    webSocketStore.update(currentState => {
        // Retrieve the existing WebSocket connection
        const websocket = currentState.connections.get(topic);
        if (websocket) {
            // Add the listener to the WebSocket object
            websocket.addEventListener(eventType, listener);

            // Update the store's listener state to include the new listener
            let currentListeners = currentState.listeners.get(topic);
            if (!currentListeners) {
                // Initialize the listeners object for the topic if it doesn't exist
                currentListeners = { message: [], close: [], open: [], error: [] };
                currentState.listeners.set(topic, currentListeners);
            }
            
            // eventTYpe'message', 'close', 'open', 'error'
            currentListeners[eventType].push(listener);
        }
        return currentState;
    });
}

// Function to remove an event listener from an existing WebSocket connection
export function removeWebSocketListener(topic: string, eventType: string, listenerToRemove: EventListener) {
    webSocketStore.update(currentState => {
        const websocket = currentState.connections.get(topic);
        const currentListeners = currentState.listeners.get(topic);

        if (websocket && currentListeners && currentListeners[eventType]) {
            // Remove the listener from the WebSocket object
            websocket.removeEventListener(eventType, listenerToRemove);

            // Filter out the listener from the store's record
            const filteredListeners = currentListeners[eventType].filter(listener => listener !== listenerToRemove);
            currentListeners[eventType] = filteredListeners;

            // Update the listener map for the topic
            currentState.listeners.set(topic, currentListeners);
        }

        return currentState;
    });
}

