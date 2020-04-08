
class websocket {
  constructor(props) {
    this.websocketUrl = props.websocketUrl;
    this.socket = null;
    this.timeId = null;
    this.callback = props.callback;
    this.init();
  }
  init(){
    this.newWebsocket(this.websocketUrl);
  }
  newWebsocket(newUrl){
    this.closeWebSocket();
    this.socket = new WebSocket(newUrl);
    this.socket.onopen = this.onOpen;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.socketError;
    this.socket.onmessage = this.socketMessage;
    this.socket.myWs = this;
  }
  closeWebSocket(){
    if(this.socket&&this.socket.close) {
      this.socket.close();
    }
  }
  onOpen(event){
    console.log('socket success');
  }
  onClose(event) {
    console.log(event);
  }
  socketError(event) {
    var that = this;
    console.log(event);
    //错误重连
    if(that.timeId) {
      clearTimeout(that.timeId);
    }
    that.timeId = setTimeout(function () {
      that.newWebsocket(that.websocketUrl)
    }, 4000);
  }
  socketMessage(event) {
//      console.log(event);
    var tag = JSON.parse(event.data);
    this.myWs.callback(tag);
  }
}

export default websocket;

