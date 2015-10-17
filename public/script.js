$(function(){
  var socket = io();
  //grabbing register information
  var $name = $('#username');

  //grabbing message information
  var $message = $('#chat');

  //hide message box
  $('.col-md-8').hide();
  $('.col-md-3').hide();

  function showalert(message,alerttype) {
    $('#alert').append('<div id="alertdiv" class="alert ' +  alerttype + '"><a class="close" data-dismiss="alert">×</a><span>'+message+'</span></div>')
    setTimeout(function() { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs
      $("#alertdiv").remove();
    }, 5000);
  }; //alert message

  $('#submit').on('click', function(event){
    socket.emit('authorize', {name: $name.val()})
    $name.val('');
  }); //submit authorization click

  socket.on('disapproved', function(message){
    showalert("Name already exists. Enter a different name","alert-danger")
  }); //socket disapproved

  socket.on('approved', function(message){
    $('#register').hide();
    $('.col-md-8').show();
    $('.col-md-3').show();
    showalert("Welcome! Enter a message to start chatting.","alert-success");
  }); //socket approved

  socket.on('newUser', function(userlist){
    $('#buddyList').empty();
    userlist.users.forEach(function(user){
        $('<li id="'+user.name+'">').text(user.name).appendTo('#buddyList')
    }); // names of users appendTo('#buddyList')
    $('#chatMessages').empty();
    userlist.messages.forEach(function(chat){
      var sentence = $('<div>')
      $('<p>').html("<span class='label label-primary'>" + chat.name + "</span> <small>" + moment(chat.createdAt).fromNow() +"</small>").appendTo(sentence);
      $('<p>').text(chat.message).appendTo(sentence)
      sentence.appendTo('#chatMessages')
    });

    var height = 0;
    $('#chatMessages div').each(function(i, value){
        height += parseInt($(this).height());
    });
    height += '';
    $('#chatMessages').animate({scrollTop: height});

  }); // newUser added

  $('#send').on('click', function(event){
    socket.emit('chat', {message: $message.val(), createdAt: moment().format('lll')})
    $message.val('');
  }); //send message click

  $('#chat').on('keyup', function(event){
    socket.emit('typing');
  }); //keyup

  socket.on('typeNotice', function(user){
    $('#'+user.name).html(user.name + '<small> is typing... </small>');
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
      var response = $('<div>')
      $('<p>').html("<span class='label label-primary'>" + returnMessage.name + "</span> <small>" + moment(returnMessage.createdAt).fromNow() +"</small>").appendTo(response)
      $('<p>').text(returnMessage.message).appendTo(response)
      response.appendTo('#chatMessages')
    });

    var height = 0;
    $('#chatMessages div').each(function(i, value){
        height += parseInt($(this).height());
    });
    height += '';
    $('#chatMessages').animate({scrollTop: height});
  });//return on chatMessage

  socket.on('users', function(event){
    $('#buddyList').empty();
    event.users.forEach(function(user){
      $('<li id="'+user.name+'">').text(user.name).appendTo('#buddyList')
    });  // names of users appendTo('#buddyList')
  });


});
