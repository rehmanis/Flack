document.addEventListener('DOMContentLoaded', () => {

    // // Connect to websocket
    // var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // // const channels = document.querySelector("#channels");
    // const sendButton = document.querySelector("#send_message");

    // // When user is connected connected, 
    // socket.on("connect", () => {

    //     socket.emit("client connected", {"username": username});

    // });

    // // When user is added to new channel.

    // socket.on("user joined channel", data =>{

    // });

    // socket.on("message", data => {
    //     const activeChannelName = localStorage.getItem("activeChannelName");
    //     console.log("message received");
    //     if (activeChannelName === data.room){
    //         $("#message_section").animate({ scrollTop: $('#message_section').prop("scrollHeight")}, 700);
    //         displayMessage(data);
    //     }else{
    //         // add a bubble next to channel to indicate unread message in visible
    //         // channels
    //     }

    // });

    // sendButton.onclick = () =>{

    //     const activeChannelName = localStorage.getItem("activeChannelName");

    //     console.log(activeChannelName)
    //     const inputMessage = document.querySelector("#user_message");
    //     socket.send({"username": username, "room": activeChannelName, "msg" : inputMessage.value});
    //     inputMessage.value = "";
    //     sendButton.disabled = true;
    // };


});
