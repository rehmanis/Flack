document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // const channels = document.querySelector("#channels");
    const sendButton = document.querySelector("#send_message");
    var activeChannelName = localStorage.getItem("activeChannelName");

    // When user is connected connected, 
    socket.on("connect", () => {

        socket.emit("client connected", {"username": username});

    });

    socket.on("message", data => {
        console.log("message received");
        if (activeChannelName === data.room){
            displayMessage(data);
        }else{
            // add a bubble next to channel to indicate unread message in visible
            // channels
        }

    });

    sendButton.onclick = () =>{

        console.log(activeChannelName)
        const inputMessage = document.querySelector("#user_message");
        socket.send({"username": username, "room": activeChannelName, "msg" : inputMessage.value});
        inputMessage.value = "";
        sendButton.disabled = true;
    };


});
