const getMessages = (action, socket, messages) => {
  return socket.emit(action, { hello: 'world' })
};

const sendMessage = (action, message, socket) => {
  return socket.broadcast.emit(action, {
    message: message
  });
}

module.exports = {
  getMessages: getMessages,
  sendMessage: sendMessage
}