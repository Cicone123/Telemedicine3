var express = require('express');
var morgan = require('morgan');
var app = express();

var server = app.listen(3000);
var io = require('socket.io')(server);

//alternate syntax
// var socket = require('socket.io');
// var io = socket(server);

app.use(morgan('combined'));
app.use(express.static('public'));

var users = [];
var chatLog = [];

io.on('connection', function(socket){
  var currentUser = '';
  socket.on("authorize", function(user){
      var username = user.name
      var userpassword = user.password
      var found = false
      users.forEach(function(existingUser){
        if (existingUser.name == username){
          found = true
        }
      });//map of existingUser
      if (username == ''){
        found = true
      }; //if blank
      if (found === true){
        socket.emit('disapproved', {message:'enter new name, name currently exist'});
      }; //if not found
      if (found === false) {
         users.push({name: user.name, password: user.password });
         currentUser = user.name
         socket.emit('approved', {message: 'you are logged in'});
         if (chatLog.length > 50){
           var chats = chatLog.slice(Math.max(chatLog.length - 50, 1));
           io.emit('newUser', {users: users, messages: chats});
         } else {
           io.emit('newUser', {users: users, messages: chatLog});
         }
       }; //if found

  }); //socket authorize

  socket.on('typing', function(){
    io.emit('typeNotice', {name: currentUser});
  });

  socket.on('stoppedtyping', function(){
    io.emit('stopNotice', {name: currentUser});
  });

  socket.on('chat', function(message){
    chatLog.push({name: currentUser, message: message.message, createdAt: message.createdAt});
    io.emit('chatMessage', {chats: chatLog});
  });

  socket.on('disconnect', function(){
    var found = false;
    users.forEach(function(existingUser, index){
        if (existingUser.name == currentUser){
          found = index
        }
      });
    users.splice(found, 1);
    io.emit('users', {users: users});
    console.log('disconnected');
  });

}); //io
