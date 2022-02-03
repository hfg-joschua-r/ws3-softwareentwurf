#!/bin/sh
cd dataservice 
nodemon index.js

cd ..
cd deviceservice 
nodemon index.js

 cd ..
cd userservice 
nodemon index.js

cd ..
cd frontend_gtlh 
npm run serve