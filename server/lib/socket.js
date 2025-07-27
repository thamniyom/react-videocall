const io = require('socket.io');
const users = require('./users');

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  console.log('initSocket-> start');
  let id;
  socket
    .on('init', async () => {
      console.log('socket.init-> start');
      id = await users.create(socket);
      console.log('socket.init-> id=',id);
      if (id) {
        socket.emit('init', { id });
      } else {
        socket.emit('error', { message: 'Failed to generating user id' });
      }
    })
    .on('request', (data) => {
      console.log('socket.request-> start');
      console.log('socket.request-> data.to=',data.to);
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('request', { from: id });
      }
    })
    .on('call', (data) => {
      console.log('socket.call-> start');
      console.log('socket.call-> data=',data);
      console.log('socket.call-> data.to=',data.to);
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('call', { ...data, from: id });
      } else {
        socket.emit('failed');
      }
    })
    .on('end', (data) => {
      console.log('socket.end-> start');
      console.log('socket.end-> data=',data);
      console.log('socket.end-> data.to=',data.to);
      const receiver = users.get(data.to);
      if (receiver) {
        receiver.emit('end');
      }
    })
    .on('disconnect', () => {
      console.log('socket.disconnect-> start');
      console.log('socket.disconnect-> id=',id);
      users.remove(id);
      console.log(id, 'disconnected');
    });
}

module.exports = (server) => {
  console.log('module.exports = (server)-> start');
  io({ path: '/bridge', serveClient: false })
    .listen(server, { log: true })
    .on('connection', initSocket);
};
