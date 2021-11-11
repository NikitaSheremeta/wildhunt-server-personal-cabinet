const dotenv = require('dotenv');
const express = require('express');
const cluster = require('cluster');
const os = require('os');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./routes/index');

dotenv.config();

const app = express();

const serverPort = process.env.SERVER_PORT;
const oneCpu = 1;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', routes);

const start = async function startServer() {
  if (cluster.isMaster) {
    const cpusCount = os.cpus().length;

    for (let i = 0; i < cpusCount - oneCpu; i++) {
      const worker = cluster.fork();

      worker.on('exit', () => {
        console.log(`Worker died! Pid: ${worker.process.pid}`);

        cluster.fork();
      });
    }
  } else {
    app.listen(serverPort, () =>
      console.log(`Server started on port: ${serverPort}, Pid: ${process.pid}`)
    );
  }
};

start();
