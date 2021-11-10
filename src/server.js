const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql');
const cluster = require('cluster');
const os = require('os');
const routes = require('./routes/index');

dotenv.config();

const app = express();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'minecraft'
});

const serverPort = process.env.SERVER_PORT;
const oneCpu = 1;

const start = function startServer() {
  app.use('/', routes);

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
    db.connect((err) =>
      err ? console.error(err.message) : console.log('MySQL connected...')
    );

    app.listen(serverPort, () =>
      console.log(`Server started on port: ${serverPort}, Pid: ${process.pid}`)
    );
  }
};

start();
