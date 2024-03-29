import { writable } from 'svelte/store';

interface WebSocketMap {
    connections: Map<string, WebSocket>;
    statuses: Map<string, boolean>;
}

const initialState: WebSocketMap = {
    connections: new Map<string, WebSocket>(),
    statuses: new Map<string, boolean>(),
};

// Initialise a writeable store
export const webSocketStore = writable<WebSocketMap>(initialState);

// Function to add a new WebSocket connection
export function addWebSocketConnection(topic: string, websocket: WebSocket) {
    webSocketStore.update(currentState => {
        currentState.connections.set(topic, websocket);
        currentState.statuses.set(topic, false);
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
