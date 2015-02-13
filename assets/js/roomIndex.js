io.socket.get('/api/room/join-lobby',function(data){

});


io.socket.on('roomremove',function(data){
    var roomList = document.querySelector('#roomList');

});

io.socket.on('roomadd',function(data){
    
    var roomList = document.querySelector('#roomList');
    var roomItem = document.createElement('li');
    roomItem.innerHTML='<a href="/room/'+data.id+'">'+data.name+'</a>';
    roomList.appendChild(roomItem);
});