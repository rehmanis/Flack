document.addEventListener('DOMContentLoaded', () => {

    const sendButton = document.querySelector("#send_message");
    const inputMessage = document.querySelector("#user_message");
    const addChannel = document.querySelector("#add_channel");
    const channels = document.querySelector("#channels");
    sendButton.disabled = true;
    channels.firstElementChild.classList.add("active");

    // Enable send message button only if there is text in the input field
    inputMessage.onkeyup = () => {
        
        if (inputMessage.value.length > 0)
            sendButton.disabled = false;
        else
            sendButton.disabled = true;

        if (inputMessage.value.length > 0 && event.keyCode === 13){
            sendButton.click();
        }
    };


    // document.querySelector("#create_channel_form").onsubmit = () => {
        
    //     console.log("I am here")
    //     const channelName = document.querySelector("#new_channel_name").value;
    //     console.log(channelName);
    //     const request = new XMLHttpRequest();
    //     request.open('POST', '/chat/create_channel');

    //     request.onload = () => {
    //         // Extract JSON data from request
    //         const data = JSON.parse(request.responseText);
    //         console.log(data);
    //         console.log(data.success);

    //         if(data.success){

    //             print("success")

    //             const a = document.createElement("a");
    //             const li = document.createElement("li");

    //             a.innerHTML = channelName;
    //             a.href = "#"

    //             li.append(a);
    //             channels.append(li);
                
    //         }
    //     }
        
    //     // Add data to send with request
    //     const data = new FormData();
    //     data.append('channel', channelName);

    //     // Send request
    //     request.send(data);
    //     document.querySelector("#createChannelModal").modal('toggle');
    // }

    function addNewChannel(event){

        const input = document.querySelector("#new_channel");
        event.preventDefault();
        console.log(input);
        console.log(input.value);

        if (input.value.length > 0 && event.keyCode === 13){
            const a = document.createElement("a");
            a.innerHTML = input.value;
            a.href = "#"
            console.log(a);
            console.log(input.parentNode);
            console.log(input.parentNode.innerHTML); 
            input.parentNode.innerHTML = a.outerHTML;

            // users.foreach(joinChannel(input.value));
        }
    }

});