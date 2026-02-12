interface DerivAuthResponse {
  authorize: {
    authorized: number;
    user_id: number;
    email: string;
    loginid: string;
    currency: string;
    is_virtual: number;
    account_status: string;
  };
}

interface DerivTickResponse {
  tick: {
    bid: number;
    ask: number;
    epoch: number;
    quote: number;
    symbol: string;
  };
}

interface DerivTradeResponse {
  buy: {
    contract_id: number;
    payout: number;
    transaction_id: number;
  };
}

class DerivWebSocket {
  private ws: WebSocket | null = null;
  private requestId = 1;
  private callbacks: Map<number, (response: any) => void> = new Map();
  private subscriptions: Map<string, (response: any) => void> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

        this.ws.onopen = () => {
          console.log('Deriv WebSocket connected');
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('Deriv WebSocket error:', error);
          reject(new Error('Failed to connect to Deriv WebSocket'));
        };

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            if (response.error) {
              console.error('Deriv API error:', response.error);
            }

            if (response.req_id) {
              const callback = this.callbacks.get(response.req_id);
              if (callback) {
                callback(response);
                this.callbacks.delete(response.req_id);
              }
            }

            if (response.subscription) {
              const subCallback = this.subscriptions.get(response.subscription.id);
              if (subCallback) {
                subCallback(response);
              }
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('Deriv WebSocket closed');
          this.ws = null;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reqId = this.requestId++;
      request.req_id = reqId;

      this.callbacks.set(reqId, resolve);

      setTimeout(() => {
        if (this.callbacks.has(reqId)) {
          this.callbacks.delete(reqId);
          reject(new Error('Request timeout'));
        }
      }, 30000);

      try {
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        this.callbacks.delete(reqId);
        reject(error);
      }
    });
  }

  subscribe(request: any, callback: (response: any) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reqId = this.requestId++;
      request.req_id = reqId;
      request.subscribe = 1;

      this.callbacks.set(reqId, (response: any) => {
        if (response.subscription) {
          this.subscriptions.set(response.subscription.id, callback);
          resolve(response.subscription.id);
        } else {
          reject(response.error);
        }
      });

      try {
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        this.callbacks.delete(reqId);
        reject(error);
      }
    });
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

let wsInstance: DerivWebSocket | null = null;

export const getDerivWS = async (): Promise<DerivWebSocket> => {
  if (!wsInstance) {
    wsInstance = new DerivWebSocket();
    await wsInstance.connect();
  }
  return wsInstance;
};

export const authorize = async (token: string): Promise<DerivAuthResponse> => {
  const ws = await getDerivWS();
  const response = await ws.send({ authorize: token });

  if (response.error) {
    throw new Error(response.error.message || 'Authorization failed');
  }

  if (!response.authorize) {
    throw new Error('Invalid response from Deriv API');
  }

  return response;
};

export const getTradingAssets = async () => {
  const ws = await getDerivWS();
  return ws.send({ active_symbols: 'brief', product_type: 'forex' });
};

export const subscribeTicks = async (
  symbol: string,
  callback: (tick: any) => void
): Promise<string> => {
  const ws = await getDerivWS();
  return ws.subscribe({ ticks: symbol }, callback);
};

export const unsubscribeTicks = async (subscriptionId: string) => {
  const ws = await getDerivWS();
  ws.unsubscribe(subscriptionId);
};

export const getTickHistory = async (symbol: string, granularity: number) => {
  const ws = await getDerivWS();
  return ws.send({
    ticks_history: symbol,
    adjust_start_time: 1,
    count: 100,
    granularity,
    style: 'candles',
    end_type: 'latest'
  });
};

export const placeTrade = async (params: {
  amount: number;
  basis: string;
  currency: string;
  duration: number;
  duration_unit: string;
  symbol: string;
  contract_type: string;
}) => {
  const ws = await getDerivWS();
  return ws.send({ buy: 1, ...params });
};

export const getAccountBalance = async () => {
  const ws = await getDerivWS();
  return ws.send({ balance: 1, subscribe: 1 });
};

export const getAccountList = async () => {
  const ws = await getDerivWS();
  return ws.send({ account_list: 1 });
};

export const switchAccount = async (loginid: string) => {
  const ws = await getDerivWS();
  return ws.send({ account_switch: 1, loginid });
};

export const disconnectDerivWS = () => {
  if (wsInstance) {
    wsInstance.disconnect();
    wsInstance = null;
  }
};
