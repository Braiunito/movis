// ecosystem.config.cjs — config de pm2 para movis-server (prod)
//
// Todas las variables van inline en `env: {...}`. pm2 las exporta al
// proceso como variables de entorno reales, sin depender de dotenv ni
// del cwd. Si rotás la TMDB key/bearer, editás aquí y:
//   pm2 startOrReload ecosystem.config.cjs --update-env

const path = require('node:path');

const ROOT = __dirname;
const SERVER_DIR = path.join(ROOT, 'server');

module.exports = {
  apps: [{
    name: 'movis-server',
    script: 'src/index.js',
    cwd: SERVER_DIR,
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '500M',
    time: true,
    out_file: path.join(ROOT, 'logs/server.out.log'),
    error_file: path.join(ROOT, 'logs/server.err.log'),
    merge_logs: true,
    env: {
      NODE_ENV: 'production',
      PORT: '3010',
      CLIENT_ORIGIN: 'https://movis.bevrim.com',
      TMDB_API_KEY: 'd2bc965c2aa65c534117386c5bd87304',
      TMDB_BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMmJjOTY1YzJhYTY1YzUzNDExNzM4NmM1YmQ4NzMwNCIsIm5iZiI6MTc3OTU4NTcwNC40NTI5OTk4LCJzdWIiOiI2YTEyNTJhODg5NWQ4NTI0ZDJjZTQ3OTciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.IX64skvg-x0CGsrALRW2ADF6W2VtIriiJR_Vjh5hB58',
    },
  }],
};
