document.addEventListener("DOMContentLoaded",function(){

    //load room data
    var room = window.ROOM_DATA;    
    if(!window.ROOM_DATA) return;

    //find dom elements
    var chatView = document.querySelector('#chatView');
    var chatViewList = chatView.querySelector('ul');
    var chatText = document.querySelector('#chatText');
    var chatForm = document.querySelector('#chatForm');    
    var chatUsers = document.querySelector('#chatUsers');

    function chooseUserName(){
        //get username
        var userName=prompt("What is your name?");

        if(userName.length < 2 || userName.length > 15){
            alert('Invalid name (must be between 2 and 15 characters)');
            return chooseUserName();
        }

        //setup socket and get initial messages
        io.socket.post('/api/room/join',{roomid:room.id,user:userName},function(data,jwrs){
            if(data){
                if(data.error){
                    alert(data.error);
                    return chooseUserName();
                }else if(Array.isArray(data.users) && Array.isArray(data.messages)){
                    data.messages.forEach(addItemToChat)
                    data.users.forEach(addChatUser);
                    return true;
                }else{
                    location.href='/';
                }
            }
        });
    }
    chooseUserName();

    //listen for user changes
    io.socket.on('userleave',removeChatUser)    
    io.socket.on('userjoin',function(data){
        addChatUser(data,true);
    });

    //listen for messages
    io.socket.on('newmessage',addItemToChat)
    io.socket.on('privatemessage',showPrivateMessage);    

    //username click - send private message
    function sendPrivateMessage(event){
        if(event.target && event.target.tagName.toLowerCase() === 'a' && hasClass(event.target,'user-link')){
            event.preventDefault();
            var to=event.target.hash.substr(1);
            if(to){
                var msg = prompt("what would you like to say?");                
                var msgData={to:to, body:msg};
                io.socket.post('/api/room/private',msgData,function(data,jwrs){
                    if(!data || !data.result){
                        alert(data.error || "Unkonwn Error");
                    }
                });
            }
        }
    };
    chatUsers.addEventListener('click',sendPrivateMessage);
    chatViewList.addEventListener('click',sendPrivateMessage);

    //send chat message
    chatForm.addEventListener('submit',function(event){
        event.preventDefault();
        var msgData={
            body:chatText.value
        };
        io.socket.post('/api/room/'+room.id+'/messages',msgData,function(data,jwrs){
            chatText.value="";
        })
    });

    //insert new chat message
    function addItemToChat(item){
        var newItem = document.createElement('li');
        var socket = item.socketId || '';
        var name='<a href="#' + socket + '" class="user-link">' + escapeHtml(item.user) + '</a>';
        var msgTime = '<i>'+formatTime(item.createdAt)+'</i>';

        newItem.innerHTML = msgTime + ' ' + name + ': ' + escapeHtml(item.body);
        chatViewList.appendChild(newItem);
        chatView.scrollTop=chatView.scrollHeight;
    }

    function showPrivateMessage(data){
        alert('private message from ' + data.from + "\r\n\r\n" + data.text)     
    }

    function addChatUser(user,announce){
        var name = '<a href="#' + user.socketId + '" class="user-link">' + escapeHtml(user.name) + '</a>';
        var userItem = document.createElement('li');
        userItem.innerHTML=name;
        chatUsers.appendChild(userItem);
        if(announce===true){
            var chatItem = document.createElement('li');
            chatItem.innerHTML=name+' has entered the room.'
            chatViewList.appendChild(chatItem);
            chatView.scrollTop=chatView.scrollHeight;            
        }

    }

    function removeChatUser(user){
        var userItems = chatUsers.querySelectorAll('a');
        for(var i = 0; i < userItems.length; i++){
            if(userItems[i].hash=='#'+user.socketId){
                //remove the parent li
                userItems[i].parentNode.parentNode.removeChild(userItems[i].parentNode);
            }
        };
    }

    function formatTime(dateString){
        var dateObj = new Date(dateString);
        return dateObj.toLocaleTimeString();
    }

    //determines if an element has a class
    function hasClass(element,findClass){
        return element.className.split(' ').indexOf(findClass) > -1
    }

    //from: http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

});