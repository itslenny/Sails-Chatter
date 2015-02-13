document.addEventListener("DOMContentLoaded",function(){
    var roomList = document.querySelector('#roomList');
    if(!roomList) return;

    io.socket.get('/api/room/join-lobby',function(data){
        data.forEach(addRoom);
    });

    io.socket.on('roomremove',function(data){
        var rooms = roomList.querySelectorAll('li a');
        for(var i = 0; i < rooms.length; i++){
            if(data.id == rooms[i].dataset.id){
                //remove parent li
                rooms[i].parentNode.parentNode.removeChild(rooms[i].parentNode);
            }
        }
    });

    io.socket.on('roomadd',addRoom);

    io.socket.on('useradded',function(data){
        changeUserCount(data.id,1);
    });

    io.socket.on('userremoved',function(data){
        changeUserCount(data.id,-1);
    });

    function addRoom(data){
        var roomItem = document.createElement('li');
        var hasS = data.userCount==1 ? '':'s';
        roomItem.innerHTML='<a href="/room/'+data.id+'" data-id="'+data.id+'" data-count="'+data.userCount+'">'+data.name+'</a> <span>('+data.userCount+' user'+hasS+')</span>';
        roomList.appendChild(roomItem);        
    }

    function changeUserCount(roomId,change) {
        var rooms = roomList.querySelectorAll('li a');
        for(var i = 0; i < rooms.length; i++){
            if(roomId == parseInt(rooms[i].dataset.id)){
                var currentCount = parseInt(rooms[i].dataset.count);
                var newCount = currentCount + change;
                var hasS = newCount==1 ? '' : 's';
                rooms[i].nextElementSibling.innerText="("+newCount+" user"+hasS+")";
                rooms[i].dataset.count=newCount;
            }
        }
    }

});

