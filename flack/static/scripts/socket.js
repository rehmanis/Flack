document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    var room = "general"
    

    // When connected, 
    socket.on("connect", () => {

    });

    socket.on("message", data => {
        const p = document.createElement("p");
        const span_username = document.createElement("span");
        const span_time = document.createElement("span");
        const br = document.createElement("br");
        span_username.innerHTML = data.username;
        span_time.innerHTML = data.time;
        p.innerHTML = span_username.outerHTML + `: ` + data.msg + br.outerHTML + span_time.outerHTML;
        document.querySelector("#message_section").append(p);

    });

    // get the send button and disable it 
    const sendButton = document.querySelector("#send_message");
    const inputMessage = document.querySelector("#user_message");
    sendButton.disabled = true;

    // Enable send message button only if there is text in the input field
    inputMessage.onkeyup = () => {
        if (inputMessage.value.length > 0)
            sendButton.disabled = false;
        else
            sendButton.disabled = true;
    };

    sendButton.onclick = () =>{

        socket.send({"username": username, "msg" : inputMessage.value});

    }


});
