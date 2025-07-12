// import { tracked } from "@trpc/server/unstable-core-do-not-import";
// import { procedure, router } from "../server";
// import { z } from 'zod';
// import EventEmitter, { on } from "events";

// const ee = new EventEmitter();

// // WebSocket connection management
// let wsConnection: WebSocket | null = null;
// let isConnected = false;

// // Message queue for handling multiple readers
// let messageQueue: any[] = [];
// let pendingUserInput: ((value: any) => void) | null = null;

// // Initialize WebSocket connection
// function initializeWebSocket() {
//     if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
//         return wsConnection;
//     }

//     // If there's an existing connection that's not open, close it
//     if (wsConnection) {
//         wsConnection.close();
//     }

//     try {
//         wsConnection = new WebSocket('ws://localhost:8002/ws/chat');
        
//         wsConnection.onopen = () => {
//             console.log('WebSocket connected to AutoGen backend');
//             isConnected = true;
//             ee.emit('connection', { status: 'connected' });
//         };

//         wsConnection.onclose = (event) => {
//             console.log('WebSocket disconnected from AutoGen backend', event.code, event.reason);
//             isConnected = false;
//             ee.emit('connection', { status: 'disconnected' });
//         };

//         wsConnection.onerror = (error) => {
//             console.error('WebSocket error:', error);
//             isConnected = false;
//             ee.emit('error', { error: 'WebSocket connection error' });
//         };

//         wsConnection.onmessage = (event) => {
//             try {
//                 const message = JSON.parse(event.data);
//                 ee.emit('message', message);
//             } catch (error) {
//                 console.error('Failed to parse WebSocket message:', error);
//                 ee.emit('error', { error: 'Failed to parse message' });
//             }
//         };

//         return wsConnection;
//     } catch (error) {
//         console.error('Failed to create WebSocket connection:', error);
//         isConnected = false;
//         ee.emit('error', { error: 'Failed to create WebSocket connection' });
//         return null;
//     }
// }

// export const autoGenRouter = router({
//     getAutoGen: procedure.query(async () => {
//         return "Hello, world!";
//     }),

//     // Send message to AutoGen backend
//     sendMessage: procedure
//         .input(z.object({
//             content: z.string(),
//             source: z.string().optional().default('user'),
//         }))
//         .mutation(async ({ input }) => {
//             try {
//                 const ws = initializeWebSocket();
                
//                 if (!ws || ws.readyState !== WebSocket.OPEN) {
//                     throw new Error('WebSocket is not connected');
//                 }

//                 const message = {
//                     content: input.content,
//                     source: input.source,
//                 };

//                 ws.send(JSON.stringify(message));
                
//                 return { success: true, message: 'Message sent successfully' };
//             } catch (error) {
//                 throw new Error(`Failed to send message: ${error}`);
//             }
//         }),

//     // Subscribe to real-time messages from AutoGen backend
//     receiveMessage: procedure
//         .input(z.object({
//             lastEventId: z.string().nullish(),
//         }).optional())
//         .subscription(async function* (opts) {
//             // Initialize WebSocket connection
//             initializeWebSocket();

//             // Listen for new messages
//             for await (const [message] of on(ee, 'message', {
//                 signal: opts.signal,
//             })) {
//                 const messageId = `msg_${Date.now()}_${Math.random()}`;
//                 yield tracked(messageId, message);
//             }
//         }),

//     // Subscribe to connection status
//     connectionStatus: procedure
//         .subscription(async function* (opts) {
//             // Initialize WebSocket connection
//             initializeWebSocket();

//             // Listen for connection status changes
//             for await (const [status] of on(ee, 'connection', {
//                 signal: opts.signal,
//             })) {
//                 const statusId = `status_${Date.now()}`;
//                 yield tracked(statusId, status);
//             }
//         }),

//     // Subscribe to errors
//     errorStream: procedure
//         .subscription(async function* (opts) {
//             // Initialize WebSocket connection
//             initializeWebSocket();

//             // Listen for errors
//             for await (const [error] of on(ee, 'error', {
//                 signal: opts.signal,
//             })) {
//                 const errorId = `error_${Date.now()}`;
//                 yield tracked(errorId, error);
//             }
//         }),

//     // Get chat history
//     getHistory: procedure
//         .input(z.object({
//             sessionId: z.string().optional(),
//         }))
//         .query(async ({ input }) => {
//             try {
//                 const response = await fetch('http://localhost:8002/history');
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 const history = await response.json();
//                 return history;
//             } catch (error) {
//                 throw new Error(`Failed to load history: ${error}`);
//             }
//         }),

//     // Health check for WebSocket server
//     healthCheck: procedure.query(async () => {
//         try {
//             // Try to connect to the WebSocket server
//             const ws = initializeWebSocket();
            
//             if (!ws) {
//                 return { status: 'disconnected', message: 'Failed to create WebSocket connection' };
//             }
            
//             if (ws.readyState === WebSocket.OPEN) {
//                 return { status: 'connected', message: 'WebSocket server is running and connected' };
//             } else if (ws.readyState === WebSocket.CONNECTING) {
//                 return { status: 'connecting', message: 'WebSocket server is connecting' };
//             } else {
//                 return { status: 'disconnected', message: 'WebSocket server is not connected' };
//             }
//         } catch (error) {
//             return { status: 'disconnected', message: `WebSocket server health check failed: ${error}` };
//         }
//     }),

//     // Legacy wsExample for compatibility
//     wsExample: procedure
//         .input(z.object({
//             lastEventId: z.string().nullish(),
//         }).optional())
//         .subscription(async function* (opts) {
//             if (opts.input?.lastEventId) {
//                 // Get messages since the last event id
//                 // This could be implemented to fetch from history
//             }
            
//             // Listen for new events
//             for await (const [data] of on(ee, 'add', {
//                 signal: opts.signal,
//             })) {
//                 const p = data as {id: string, content: string}
//                 yield tracked(p.id, p);
//             }
//         }),
// });