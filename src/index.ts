import * as hello from './hello/sayhello';

function getmessage(){
    document.querySelector('#msg').innerHTML= hello.sayHello("User");
}
