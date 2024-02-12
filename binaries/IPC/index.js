import { WebSocketServer } from "ws";
import WebSocket from "ws";
/**
 * @class IPC
 * @description Inter-Process Communication - allows you to communicate with vaderjs using Bun.js
 */
class IPC {
  constructor(config = { port: 3434 }) {
    this.server = {
      port: config.port,
      /**
       * @property {IPC} instance - The instance of the IPC server
       */
      instance: null,
      clients: [],
      /**
       *
       * @private
       */
      sendMsg: (msg) => {
        this.server.clients.forEach((client) => {
          client.send(JSON.stringify({ IPC_TYPE: this.type, msg }));
        });
      },
    };
    /**
     * @enum {Object} typeEnums - The type of process to spawn
     */
    this.typeEnums = {
      /**
       * @enum {Number} WATCHER - The file watching process
       */
      WATCHER: 1,
      /**
       * @enum {Number} PAGEGENERATOR - The page generator process
       */
      PAGEGENERATOR: 2,
      /**
       * @enum {Number} DFT - The default process
       */
      DFT: 3,
    };

    this.listeners = [];
    this.type = this.typeEnums.DFT;
  }
  /**
   * @property {Boolean} NOLISTEN - Whether to listen for incoming messages or not
   */
  NOLISTEN = false;
  /**
   * @Object Console
   * @description The console object to use for logging - Bun.spawn has 0 way of reading logs from the spawned process so this is a workaround
   */
  Console = {
    log: (msg, IPC_TYPE) => {
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify({ IPC_TYPE: PROTOCOL, CONSOLE: true, LOG: true, msg }));
      });
    },
    error: (msg, errorLevel, IPC_TYPE) => {
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify({ IPC_TYPE: PROTOCOL, CONSOLE: true, ERROR: true, errorLevel, msg }));
      });
    },
    warn: (msg, IPC_TYPE) => {
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify({ IPC_TYPE: PROTOCOL, CONSOLE: true, WARN: true, msg }));
      });
    },
    info: (msg, IPC_TYPE) => {
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify({ IPC_TYPE: PROTOCOL, CONSOLE: true, INFO: true, msg }));
      });
    },
    debug: (msg, IPC_TYPE) => {
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify({ IPC_TYPE: PROTOCOl, CONSOLE: true, DEBUG: true, msg }));
      });
    },
  };

  spawnServer(type = this.typeEnums.DFT) {
    this.isntSpawned = false;
    if (!this.server.instance) {
      // if used in achildProcess reconnect to the main running server
      this.server.instance = new WebSocketServer({ port: this.server.port });
    } else {
      // switch type
      this.server.instance.clients.forEach((client) => {
        client.send(JSON.stringify({ PROTO_CHANGE: true, IPC_TYPE: type }));
      });
    }

    this.server.instance.on("connection", (ws) => {
      this.server.clients.push(ws);

      this.server.instance.clients.forEach((client) => {
        client.send(JSON.stringify({ ESTABLISHED: true, IPC_TYPE: type }));
      });
      ws.on("message", (msg) => {
        msg = JSON.parse(msg);
        if (msg.CLIENTINIT) {
          let port = msg.port;
          ws.send(JSON.stringify({ ESTABLISHED: true, IPC_TYPE: type }));
          return;
        } else if (msg.SERVERINIT) {
          ws.send(JSON.stringify({ ESTABLISHED: true, IPC_TYPE: type }));
          return;
        }

        this.server.clients.forEach((client) => {
          client.send(JSON.stringify(msg));
        });
      });
    });

    this.server.instance.on("close", () => {
      this.server.clients = [];
    });

    // spawn if nolisten is false
    this.isntSpawned = true;
  }

  /**
   * @method newServer
   * @description Creates a new IPC server instance
   * @param {IPC.typeEnums} proto
   * @param {Object} config
   * @returns
   */
  async newServer(proto = 0, config = { port: 3434 }) {
    const client = new WebSocket(`ws://localhost:${config.port}`);

    client.on("open", () => {
      client.send(JSON.stringify({ SERVERINIT: true, IPC_TYPE: proto }));
    });
    client.on("message", (msg) => {
      if (msg.ESTABLISHED && msg.IPC_TYPE === proto) {
        config?.onMessage(msg);
      }
    });
    let port = config.port;

    const sendMsg = (msg) => {
      if (!client.readyState) {
        let i = setInterval(() => {
          if (client.readyState) {
            client.send(JSON.stringify({ IPC_TYPE: proto, msg, port, isServer: true }));
            clearInterval(i);
          }
        }, 1000);
        return;
      }
      client.send(JSON.stringify({ IPC_TYPE: proto, msg, port, isServer: true }));
    };

    sendMsg({ ESTABLISHED: true, IPC_TYPE: proto, port });
    return {
      sendMsg: (msg) => {
        sendMsg(msg);
      },
      /**
       * @method Console
       * @description The console object to use for logging - Bun.spawn has 0 way of reading logs from the spawned process so this is a workaround
       */
      Console: {
        log: (msg) => {
          sendMsg({ CONSOLE: true, data: msg });
        },
        error: (msg, errorLevel) => {
          sendMsg({ CONSOLE: true, ERROR: true, errorLevel, msg });
        },
        warn: (msg) => {
          sendMsg({ CONSOLE: true, WARN: true, msg });
        },
        info: (msg) => {
          sendMsg({ CONSOLE: true, INFO: true, msg });
        },
      },
      listen: (callback) => {
        client.on("message", (msg) => {
          callback(msg);
        });
      },
      onError: (callback) => {
        client.on("error", (err) => {
          callback(err);
        });
      },
    };
  }

  listen(callback) {
    this.server.instance.on("message", (msg) => {
      callback(msg);
    });
  }

  client(config = { use: this.typeEnums.DFT, port: 0, callback: () => {} }) {
    if (!this.server.instance) {
      this.spawnServer();
    }
    const ws = new WebSocket(`ws://localhost:${config.port}`);
    ws.on("open", () => {
      console.log(config);
    });
    ws.send(JSON.stringify({ CLIENTINIT: true, IPC_TYPE: config.use, port: config.port }));

    function listen(callback) {
      ws.on("message", (msg) => {
        callback(msg);
      });
    }
    return {
      Console: {
        read: (callback) => {
          listen((msg) => {
            msg = JSON.parse(msg.toString());
            if (msg.isServer && msg.IPC_TYPE === config.use && msg.port === config.port && msg?.msg?.CONSOLE) {
              callback(msg);
            }
          });
        },
        write: (msg) => {
          ws.send(JSON.stringify({ CONSOLE_LOG: true, msg }));
        },
      },
      sendMsg: (msg) => {
        ws.send(JSON.stringify({ IPC_TYPE: config.use, msg }));
      },
      listen: (callback) => {
        ws.on("message", (msg) => {
          callback(msg);
        });
      },
      close: () => {
        ws.close();
      },
      onError: (callback) => {
        ws.on("error", (err) => {
          callback(err);
        });
      },
    };
  }

  sendMsg(batch, callback) {
    switch (true) {
      case Array.isArray(batch):
        console.log(`Using incremental sending`);
        let timeBetween = 1000;
        batch.forEach((msg, i) => {
          setTimeout(() => {
            this.server.sendMsg(msg);
          }, i * timeBetween);
        });
        break;
      case typeof batch === "string":
        this.server.sendMsg(batch);
        break;
      default:
        this.server.sendMsg(batch.toString());
        break;
    }
  }
}

/**
 * @module IPCServer
 * @description The IPC server instance
 
 */
let IPCServer = new IPC({ port: 3434 });

export default IPCServer;
