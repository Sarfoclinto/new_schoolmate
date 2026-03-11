import type { Permission } from "@/config/permissions";
import type {
  EventSubscriber,
  SignalRConfig,
  SignalREventHandler,
  SignalREventName,
} from "@/types/signalr.type";
import * as signalR from "@microsoft/signalr";

type Connection = signalR.HubConnection & {
  on<T extends SignalREventName>(
    methodName: T,
    handler: SignalREventHandler<T>,
  ): void;
};

/**
 * Core SignalR Client Manager
 * Handles connection lifecycle and event subscriptions
 */
export class SignalRClient {
  private connection: Connection | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscribers: Map<string, EventSubscriber<any>> = new Map();
  private isStarting = false;
  private config: SignalRConfig;

  constructor(config: SignalRConfig) {
    this.config = config;
  }

  /**
   * Initialize and start the signalR connection
   */
  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log("[SignalR_Client] Already connected");
      return;
    }
    if (this.isStarting) {
      console.log("[SignalR_Client] Connection already starting");
      return;
    }

    this.isStarting = true;
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.config.hubUrl, {
          accessTokenFactory: () => {
            const token = this.config.accessTokenFactory?.() ?? null;
            return token ?? "";
          },
        })
        .withAutomaticReconnect(
          this.config.automaticReconnect ?? [0, 2000, 10000, 30000],
        )
        .configureLogging(this.mapLogLevel(this.config.logLevel ?? "info"))
        .build();

      this.setupConnectionLifecycle();
      this.setupEventHandlers();

      await this.connection.start();
      this.emit("connected");
      console.log("[SignalR_Client] Connected successfully");
    } catch (error) {
      console.error("[SignalR_Client] Failed to connect: ", error);
      this.emit("disconnected", error as Error);
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Stop the SignalR connection
   */
  async stop(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      this.connection = null;
      console.log("[SignalR_Client] Disconnected");
    } catch (error) {
      console.error("[SignalR_Client] Error stopping connection: ", error);
      throw error;
    }
  }

  /**
   * Get current connection state
   */
  get state(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Subscribe to a SignalR event with type safety
   */
  on<T extends SignalREventName>(
    event: T,
    handler: SignalREventHandler<T>,
  ): () => void {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    const subscriber: EventSubscriber<T> = { event, handler, id };
    this.subscribers.set(id, subscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
    };
  }

  /**
   * Emit event to all subscribers
   */
  private emit<T extends SignalREventName>(
    event: T,
    ...args: Parameters<SignalREventHandler<T>>
  ): void {
    this.subscribers.forEach((subscriber) => {
      if (subscriber.event === event) {
        try {
          subscriber.handler(...args);
        } catch (error) {
          console.error(
            `[SignalR_Client] Error in event handler for ${event}:`,
            error,
          );
        }
      }
    });
  }

  /**
   * Setup all SignalR server event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // use this.connection.on to subscribe to server events
    this.connection.on("receivePermissions", (permissions: Permission[]) => {
      this.emit("receivePermissions", permissions);
    });

    //
    this.connection.on("receiveActiveTerms", (terms) => {
      this.emit("receiveActiveTerms", terms);
    });

    this.connection.on("receiveActiveYear", (year) => {
      this.emit("receiveActiveYear", year);
    });

    this.connection.on("error", (err) => this.emit("error", err));
  }

  /**
   * Setup connection lifecycle handlers
   */
  private setupConnectionLifecycle(): void {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      console.log("[SignalR_Client] Connection closed", error);
      this.emit("disconnected", error);
    });

    this.connection.onreconnecting(() => {
      console.log("[SignalR_Client] Reconnecting...");
      this.emit("reconnecting");
    });

    this.connection.onreconnected(() => {
      console.log("[SignalR_Client] Reconnected");
      this.emit("reconnected");
    });
  }

  /**
   * Invoke a server method
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async invoke<T = void>(methodName: string, ...args: any[]): Promise<T> {
    if (!this.connection) {
      throw new Error("[SignalR_Client] Not connected");
    }

    if (this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(
        `[SignalR_Client] Cannot invoke method in state: ${this.connection.state}`,
      );
    }

    try {
      return await this.connection.invoke<T>(methodName, ...args);
    } catch (error) {
      console.error(`[SignalR_Client] Error invoking ${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Server method proxies - type-safe wrappers
   */
  //   eg
  //   async createTicket(
  //     title: string,
  //     visibility: string,
  //     userId: string,
  //   ): Promise<void> {
  //     await this.invoke("CreateTicket", title, visibility, userId);
  //   }

  /**
   * Map log level string to SignalR LogLevel
   */
  private mapLogLevel(level: string): signalR.LogLevel {
    const levels: Record<string, signalR.LogLevel> = {
      trace: signalR.LogLevel.Trace,
      debug: signalR.LogLevel.Debug,
      info: signalR.LogLevel.Information,
      warn: signalR.LogLevel.Warning,
      error: signalR.LogLevel.Error,
      none: signalR.LogLevel.None,
    };
    return levels[level] ?? signalR.LogLevel.Information;
  }

  /**
   * Cleanup all subscribers
   */
  dispose(): void {
    this.subscribers.clear();
  }
}
