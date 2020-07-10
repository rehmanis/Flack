document.addEventListener('DOMContentLoaded', () => {

    const sendButton = document.querySelector("#send_message");
    const inputMessage = document.querySelector("#user_message");
    const addChannel = document.querySelector("#add_channel");
    const channels = document.querySelector("#channels");
    sendButton.disabled = true;

    // Enable send message button only if there is text in the input field
    inputMessage.onkeyup = () => {
        console.log(inputMessage.value.length);
        if (inputMessage.value.length > 0)
            sendButton.disabled = false;
        else
            sendButton.disabled = true;

        if (inputMessage.value.length > 0 && event.keyCode === 13){
            sendButton.click();
        }
    };

    addChannel.onclick = () =>{

        if (!document.querySelector("#new_channel")){
            const li = document.createElement("li");
            const input = document.createElement("input");
            input.autofocus = true;
            input.type = 'text';
            input.placeholder = "Channel name..."
            input.id = "new_channel"
            input.style.background = "#325C74";
            input.style.border = "none";
            input.style.color = "white";


            li.append(input);
            channels.append(li);

            input.addEventListener("keyup", addNewChannel);

        }

        return false;
    };

    function addNewChannel(event){

        const input = document.querySelector("#new_channel");
        event.preventDefault();

        if (input.value.length > 0 && event.keyCode === 13){
            const a = document.createElement("a");
            a.innerHTML = input.value;
            a.href = "#"
            console.log(a);
            console.log(input.parentNode);
            console.log(input.parentNode.innerHTML); 
            input.parentNode.innerHTML = a.outerHTML;

            users.foreach(joinChannel(input.value));
        }
    }

});