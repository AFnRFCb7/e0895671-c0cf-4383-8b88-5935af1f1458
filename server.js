#!/usr/bin/env node

import express from 'express';
import axios from 'axios';
import AxiosDigest from 'axios-digest';
import crypto from 'crypto';


import http from 'http';
const port = 3000

const base = "http://challenge.phosphorus.io";
let count = 1;

const publicKey = "root";
const privateKey = "pass" ;

async function digit(){
    const base = "http://challenge.phosphorus.io";
    const main = await axios.get(base);
    const id = (main.data.match(/([0-9][0-9][0-9][0-9][0-9])/,"$1"))[0];
    const params = { id : id , imagepath: "/mjpg/video.mjpg?camera=1", size: 1 } ;
    const uri = `/view/view.shtml?id=${params.id}&imagepath=${encodeURIComponent(params.imagepath)}&size=${params.size}` ;
    const url = `${base}${uri}`;
    const success = await axios.get(url).then(success => console.log("This is unexpected.", success), err => {
	const authDetails = err.response.headers['www-authenticate'].split(', ').map(v => v.split('='));
	++count;
	const nonceCount = ('00000000' + count).slice(-8);
	const cnonce = crypto.randomBytes(24).toString('hex');
		  
	const realm = authDetails[0][1].replace(/"/g, '');
	const nonce = authDetails[1][2].replace(/"/g, '');
	
	const md5 = str => crypto.createHash('md5').update(str).digest('hex');
	
	const HA1 = md5(`${publicKey}:${realm}:${privateKey}`);
	const HA2 = md5(`GET:${uri}`);
	const response = md5(`${HA1}:${nonce}:${nonceCount}:${cnonce}:auth:${HA2}`);
	
	const authorization = `Digest username="${publicKey}",realm="${realm}",` +
	      `nonce="${nonce}",uri="${uri}",qop="auth",algorithm="MD5",` +
	      `response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`;
	console.log(authDetails);
	console.log();
	console.log(authorization);
	return axios.get(url, { headers: { authorization } });
    });
    console.log(success);
}

digit().then(success => console.log("SUCCESS", success), failure => console.log("FAILURE"));
/*
process.exit(0);

async function dig(uri, params) {
    const data = await axios.get(`${base}${uri}`).
	  catch(err => {
	      if (err.response.status === 401) {
		  const authDetails = err.response.headers['www-authenticate'].split(', ').map(v => v.split('='));

		  ++count;
		  const nonceCount = ('00000000' + count).slice(-8);
		  const cnonce = crypto.randomBytes(24).toString('hex');
		  
		  const realm = authDetails[0][1].replace(/"/g, '');
		  const nonce = authDetails[1][2].replace(/"/g, '');
		  
		  const md5 = str => crypto.createHash('md5').update(str).digest('hex');
		  
		  const HA1 = md5(`${publicKey}:${realm}:${privateKey}`);
		  const HA2 = md5(`GET:${uri}`);
		  const response = md5(`${HA1}:${nonce}:${nonceCount}:${cnonce}:auth:${HA2}`);
		  
		  const authorization = `Digest username="${publicKey}",realm="${realm}",` +
			`nonce="${nonce}",uri="${uri}",qop="auth",algorithm="MD5",` +
			`response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`;
		  console.log(authDetails);
		  console.log();
		  console.log(authorization);

		  return axios.get(`${base}${uri}?id=?`, Object.assign({ headers: { authorization } }, params));
	      }
	      throw err;
	  }).
	  catch(err => {
	      throw err;
	  });
    
    return data;
};

dig("/view/view.shtml", { id: 7485, imagepath: "/mjpg/video.mjpg?camera=1", size: 1} ).then(x => console.log(x), failure => console.log("BAD STUFF", failure));

const app = express();
app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .get('/', (req, res) => [ res.send('Hello World!') , console.log("WTF") ])
    .post("/api/device/:addr", (req, res) => dig("/admin/about.shtml").then(data => res.send(data)))
    .post("/zapi/device/:addr", (req, res) => res.send(`posting ${req.params.addr}, ${Object.keys(req.body)} login=${req.body.login}, password=${req.body.password}`))
    .listen(port, () => console.log(`Example app listening on port ${port}`));
*/
