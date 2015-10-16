$(function(){
  var socket = io();
  //grabbing register information
  var $name = $('#username');

  //grabbing message information
  var $message = $('#chat');

  //hide message box
  $('#message').hide();


  $('#submit').on('click', function(event){
    socket.emit('authorize', {name: $name.val()})
    $name.val('');
  }); //submit authorization click

  socket.on('disapproved', function(message){
    alert(message.message);
  }); //socket disapproved

  socket.on('approved', function(message){
    $('#register').hide();
    $('#message').show();
    alert(message.message);
  }); //socket approved


  socket.on('newUser', function(userlist){
    $('#buddyList').empty();
    userlist.users.forEach(function(user){
        $('<li id="'+user.name+'">').text(user.name).appendTo('#buddyList')
    }); // names of users appendTo('#buddyList')
    $('#chatMessages').empty();
    userlist.messages.forEach(function(chat){
      $('<p>').text(chat.name +": "+ moment(chat.createdAt).fromNow() +" " + chat.message).appendTo('#chatMessages');
    });
  }); // newUser added

  $('#send').on('click', function(event){
    socket.emit('chat', {message: $message.val(), createdAt: moment().format('lll')})
  }); //send message click

  $('#chat').on('keyup', function(event){
    socket.emit('typing');
  }); //keyup

  socket.on('typeNotice', function(user){
    $('#'+user.name).text(user.name + ' is typing...');
  });

  $('#chat').on('blur', function(event){
    socket.emit('stoppedtyping');
  }); //keyup

  socket.on('stopNotice', function(user){
    $('#'+user.name).text(user.name);
  });

  socket.on('chatMessage', function(list){
    $('#chatMessages').empty();
    list.chats.forEach(function(returnMessage){
      $('<p>').text(returnMessage.name +": "+ moment(returnMessage.createdAt).fromNow() +":"+ returnMessage.message).appendTo('#chatMessages');
    });
  });//return on chatMessage

  socket.on('users', function(event){
    $('#buddyList').empty();
    event.users.forEach(function(user){
      $('<li id="'+user.name+'">').text(user.name).appendTo('#buddyList')
    });  // names of users appendTo('#buddyList')
  });
});
