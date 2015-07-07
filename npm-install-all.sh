#!/usr/bin/env bash

echo 'executing npm install in build directory'
cd build;
npm install

echo 'executing npm install in tests directory'
cd ../tests;
npm install

echo 'executing npm install in app directory'
cd ../app;
npm install
