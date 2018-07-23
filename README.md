# project

CMPE 295 project
To run it cd ../trial
node server


Current status: not sure not to combine nodejs with jquery
without running node server, only drag the page to browser, we can create sketch,
however, when we run node server, we can not sketch... need to study how to combine node with page with script.

Modified server.js and index.html to receive the stroke data from front-end and ran seshat from backend using shell script through node server. The output is being stored in a text file.

The project uses handwritten math expression parser as the underlying engine developed by F. Alvaro. It can be found at https://github.com/falvaro/seshat. Download it and compile to get seshat executable binary. Further instructions to run seshat can be found in the README.md of seshat repository at https://github.com/falvaro/seshat/blob/master/README.md.
