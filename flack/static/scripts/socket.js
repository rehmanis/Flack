document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    const channels = document.querySelector("#channels");
    const sendButton = document.querySelector("#send_message");
    var activeChannelName = localStorage.getItem("activeChannelName");
    var activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));

    if(!activeChannelName){

        const users = $("#get_all_users").data("users");
        channels.firstElementChild.classList.add("active");
        localStorage.setItem("activeChannelName", document.querySelector("li.active a").innerHTML);
        localStorage.setItem("activeChannelUsers", JSON.stringify(users));        
        activeChannelName = localStorage.getItem("activeChannelName");
        activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));

    }else{
        document.querySelector("#" + activeChannelName).classList.add("active");
        document.querySelector("#num_users a span").innerHTML = activeChannelUsers.length;
    }

    document.querySelector("#curr_channel").firstElementChild.innerHTML = "#" + activeChannelName;
    getMessages(activeChannelName);

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


    channels.addEventListener("click", event => {

        console.log("channel clicked");
        console.log(event.target);

        if (event.target && (event.target.nodeName == "A" || event.target.nodeName == "LI")){

            let activeChannel = document.querySelector("li.active");
            activeChannel.classList.remove("active");

            if (event.target.nodeName == "A"){
                event.target.parentNode.classList.add("active");
            }else{
                event.target.classList.add("active");
            }

            activeChannelName = localStorage.getItem("activeChannelName");
            channelSelected = (event.target.innerText || event.target.textContent);    
            
            if (activeChannelName != channelSelected){
                console.log(activeChannelName);
                localStorage.setItem("activeChannelName", channelSelected);        
                document.querySelector("#curr_channel").firstElementChild.innerHTML = "#" + channelSelected;
                getMessages(channelSelected);
                activeChannelName = channelSelected;
            }

            document.querySelector("#user_message").focus();
        }
    } );

    // repeat code need to combine remove this later
    document.querySelector("#usersList").addEventListener("click", event => {

        if (event.target && (event.target.nodeName == "A" || event.target.nodeName == "LI")){

            document.querySelector("li.active").classList.remove("active");

            if (event.target.nodeName == "A"){
                event.target.parentNode.classList.add("active");
            }else{
                event.target.classList.add("active");
            }

            currRoom = event.target.innerText || event.target.textContent;
            document.querySelector("#message_section").innerHTML = "";

        }


    });

    function displayMsg(msg){
        const p = document.createElement("p");
        p.innerHTML = msg;
        document.querySelector("#message_section").append(p);

    }

    function joinChannel(channel){
        currRoom = channel;
        socket.emit("join", {"username": username, "room": channel});
        document.querySelector("#message_section").innerHTML = "";
        
    }

    function leaveChannel(channel){
        socket.emit("leave", {"username": username, "room": channel});
    }

    function displayMessage(data){ 

        const p = document.createElement("p");
        const br = document.createElement("br");
        
        const span_time = document.createElement("span");
        const span_username = document.createElement("span");
        const span_date = document.createElement("span");
        span_username.innerHTML = data.username;
        span_time.innerHTML = data.time;
        span_date.innerHTML = data.date;
        span_time.className += " time";
        span_username.className += " username";
        p.innerHTML = span_username.outerHTML + " " + span_time.outerHTML + br.outerHTML + data.msg;

        document.querySelector("#message_section").append(p);

    }

    function getMessages(room){
        const request = new XMLHttpRequest();
        request.open('POST', '/messages');
        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            document.querySelector("#message_section").innerHTML = "";

            for (var i = 0; i < data.entries.length; i++){
                displayMessage(data.entries[i]);
            }

            localStorage.setItem("activeChannelUsers", JSON.stringify(data.users));
            activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));
            document.querySelector("#num_users a span").innerHTML = activeChannelUsers.length;

        }
        
        // Add data to send with request
        const data = new FormData();
        data.append('channel', room);

        // Send request
        request.send(data);

        return false;
    }

});
