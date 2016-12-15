var io = require('socket.io')(process.env.PORT || 8081);
console.log('hello');
var drawInfo = {
	'currentDrawId' : 0,
	'guessWord' : ''
};
// 房间成员列表
var userList = {};
io.on('connection', function (socket) {
	
	socket.on('addUser', function (info) {
		console.log(info);
		socket.join(info.roomId);
		socket.userName = info.userName;
		socket.roomId = info.roomId;
		userList[info.userName] = socket;
		io.sockets.in(socket.roomId).emit('login', {
			'cmd' : 'login',
			'userName' : socket.userName
		});
		io.sockets.in(socket.roomId).emit('userJoined', {
			'cmd' : 'userJoined',
			'userName' : socket.userName,
			'userList' : io.sockets.adapter.rooms[socket.roomId]
		});
		/*socket.broadcast.emit('userJoined', {
			'cmd' : 'userJoined',
			'userName' : socket.userName
		});*/
	});

	socket.on('newMessage', function (msg) {
		console.log(msg);
		var data = { 
			'cmd' : 'newMessage',
			'userName' : socket.userName,
			'msg' : msg
		};
		io.sockets.in(socket.roomId).emit('newMessage', data);
		//socket.broadcast.emit('newMessage', data);
	});
	socket.on('drawAction', function (msg) {
		console.log(msg);
		var data = { 
			'cmd' : 'drawAction',
			'userName' : socket.userName,
			'msg' : msg
		};
		io.sockets.in(socket.roomId).emit('drawAction', data);
	});
	socket.on('getDrawClient', function () {
		console.log('getDrawClient');
		var userList = io.sockets.adapter.rooms[socket.roomId];
		
		var clients = Object.keys(userList.sockets);
		if(clients.length == 1){
			drawInfo.currentDrawId = clients[0];
		}
		var data = { 
			'cmd' : 'getDrawClient',
			'msg' : {
				'drawClientId':drawInfo.currentDrawId
			}
		};
		io.sockets.in(socket.roomId).emit('getDrawClient', data);
	});
	socket.on('setGuessWord',function(msg){
		console.log(msg);
		drawInfo.guessWord = msg.word;
	});
	socket.on('getGuessWord',function(msg){
		console.log('getGuessWord');
		if(drawInfo.guessWord == msg.word){
			console.log('有人猜对了');
			var data = {
				'userName':socket.userName
			};
			io.sockets.in(socket.roomId).emit('guessEnd', data);
		}else{
			var data = {
				'userName':socket.userName,
				'answer' : msg.word
			};
			io.sockets.in(socket.roomId).emit('guessWrong',data);
			console.log('猜错了');
		}
	});
});
