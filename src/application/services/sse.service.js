const EventEmitter = require('events');

class SSEService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map();
  }

  createKey(type, key = 'global') {
    return `${type}:${key}`;
  }

  subscribe(type, key, res) {
    const clientKey = this.createKey(type, key);
    if (!this.clients.has(clientKey)) {
      this.clients.set(clientKey, new Set());
    }

    const clients = this.clients.get(clientKey);
    clients.add(res);

    res.on('close', () => {
      this.unsubscribe(type, key, res);
    });

    res.write('retry: 15000\n');
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'connected', type, key })}\n\n`);
  }

  unsubscribe(type, key, res) {
    const clientKey = this.createKey(type, key);
    const clients = this.clients.get(clientKey);
    if (!clients) return;

    clients.delete(res);
    if (clients.size === 0) {
      this.clients.delete(clientKey);
    }
  }

  sendEvent(res, eventName, payload) {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      // If a write fails, the client will be cleaned up on 'close'.
      console.warn('SSE write failed:', err.message);
    }
  }

  publish(type, key, eventName, payload) {
    const clientKey = this.createKey(type, key);
    const clients = this.clients.get(clientKey);
    if (!clients) return;

    for (const res of clients) {
      this.sendEvent(res, eventName, payload);
    }
  }

  publishAll(type, eventName, payload) {
    const prefix = `${type}:`;
    for (const [clientKey, clients] of this.clients.entries()) {
      if (clientKey.startsWith(prefix)) {
        for (const res of clients) {
          this.sendEvent(res, eventName, payload);
        }
      }
    }
  }
}

module.exports = new SSEService();
