document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var currChannel = "welcome";
    joinChannel(currChannel);

    // When user is connected connected, 
    socket.on("connect", () => {

        socket.emit("user online", {"username": username});

    });

    socket.on("message", data => {
        console.log("here");
        const p = document.createElement("p");
        const br = document.createElement("br");
        
        if (data.time && data.username){
            const span_time = document.createElement("span");
            const span_username = document.createElement("span");
            span_username.innerHTML = data.username;
            span_time.innerHTML = data.time;
            p.innerHTML = span_username.outerHTML + `: ` + data.msg + br.outerHTML + span_time.outerHTML;
        }else{
            p.innerHTML = data.msg + br.outerHTML;
        }

        document.querySelector("#message_section").append(p);

    });

    // get the send button and disable it 
    const sendButton = document.querySelector("#send_message");

    sendButton.onclick = () =>{
        const inputMessage = document.querySelector("#user_message");
        socket.send({"username": username, "room": currChannel, "msg" : inputMessage.value});
        console.log(inputMessage.innerHTML);
        inputMessage.value = "";
        sendButton.disabled = true;
    };


    const channels = document.querySelector("#channels");

    channels.addEventListener("click", event => {
        if (event.target && event.target.nodeName == "A" || event.target.nodeName == "LI"){
            let newChannel = event.target.innerHTML;
            console.log(newChannel);
            if (currChannel === newChannel){
                const msg = `You are already in room ${currChannel}`;
                displayMsg(msg);
            }else{

                leaveChannel(currChannel);
                joinChannel(newChannel)
            }
        }
    } );

    function displayMsg(msg){
        const p = document.createElement("p");
        p.innerHTML = msg;
        document.querySelector("#message_section").append(p);

    }

    function joinChannel(channel){
        currChannel = channel;
        socket.emit("join", {"username": username, "room": channel});
        document.querySelector("#message_section").innerHTML = "";
        
    }

    function leaveChannel(channel){
        socket.emit("leave", {"username": username, "room": channel});
    }

});
