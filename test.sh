#!/bin/sh

echo GET &&
curl --request GET http://localhost:3000 &&
    echo &&
    echo POST &&
    curl --request POST --data "login=emory" --data "password=pass" http://localhost:3000/api/device/xxx
