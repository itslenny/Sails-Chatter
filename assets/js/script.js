document.addEventListener("DOMContentLoaded",function(){

    //load room data
    var room = window.ROOM_DATA;    
    if(!window.ROOM_DATA) return;

    //find dom elements
    var chatView = document.querySelector('#chatView');
    var chatViewList = chatView.querySelector('ul');
    var chatText = document.querySelector('#chatText');
    var chatForm = document.querySelector('#chatForm');    

    //get username
    var userName=prompt("What is your name?");

    //setup socket and get initial messages
    io.socket.post('/api/room/join',{roomid:room.id,user:userName},function(data,jwrs){
        if(data){
            data.forEach(addItemToChat)
        }
    });

    //listen for new messages
    io.socket.on('newmessage',function(data){
        addItemToChat(data);
    })

    //listen for private messages
    io.socket.on('privatemessage',function(data){
        alert('private message from ' + data.from + "\r\n\r\n" + data.text)
    });    

    //username click - send private message
    chatViewList.addEventListener('click',function(event){
        if(event.target && event.target.tagName.toLowerCase() === 'a' && hasClass(event.target,'user-link')){
            event.preventDefault();
            var msg = prompt("what would you like to say?");
            var to=event.target.getAttribute('href').substr(1);
            var msgData={to:to ,user:userName, body:msg};
            io.socket.post('/api/room/private',msgData,function(data,jwrs){
                if(!data && !data.result){
                    alert("Error. Unable to send message.")
                }
            });
        }
    });

    //send chat message
    chatForm.addEventListener('submit',function(event){
        event.preventDefault();
        var msgData={
            body:chatText.value,
            user:userName
        };
        io.socket.post('/api/room/'+room.id+'/messages',msgData,function(data,jwrs){
            chatText.value="";
        })
    });

    //insert new chat message
    function addItemToChat(item){
        var newItem = document.createElement('li');
        if(item.socket){
            newItem.innerHTML='<i>'+item.createdAt+'</i> <a href="#'+item.socket+'" class="user-link">'+item.user+':</a> '+escapeHtml(item.body);
        }else{
            newItem.innerHTML='<i>'+item.createdAt+'</i> <b>'+item.user+':</b> '+item.body;
        }
        
        chatViewList.appendChild(newItem);
        chatView.scrollTop=chatView.scrollHeight;
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