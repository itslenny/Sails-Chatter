document.addEventListener("DOMContentLoaded",function(){
    var chatView = document.querySelector('#chatView');
    if(!chatView) return;
    var chatViewList = document.querySelector('#chatView ul');
    var chatText = document.querySelector('#chatText');
    var chatForm = document.querySelector('#chatForm');    
    var room = window.ROOM_DATA;

    var userName=prompt("What is your name?");

    //global function
    chatViewList.addEventListener('click',function(event){
        if(event.target && hasClass(event.target,'user-link')){
            var msg = prompt("what would you like to say?");
            var pData={toid: obj.getAttribute('href').substr(1),user:userName, body:msg};
            io.socket.post('/api/room/private',pData,function(data,jwrs){

            });
        }
    });

    var addItemToChat=function(item){
        var newItem = document.createElement('li');
        if(item.socket){
            newItem.innerHTML='<i>'+item.createdAt+'</i> <a href="#'+item.socket+'" class="user-link">'+item.user+':</a> '+escapeHtml(item.body);
        }else{
            newItem.innerHTML='<i>'+item.createdAt+'</i> <b>'+item.user+':</b> '+item.body;
        }
        
        chatViewList.appendChild(newItem);
        chatView.scrollTop=chatView.scrollHeight;
    }

    io.socket.on('newmessage',function(data){
        addItemToChat(data);
    })

    io.socket.on('privatemessage',function(data){
        alert('private message from ' + data.from + "\r\n\r\n" + data.text)
    });

    io.socket.post('/api/room/join',{roomid:room.id,user:userName},function(data,jwrs){
        if(data){
            data.forEach(addItemToChat)
        }
    });

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