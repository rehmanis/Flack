document.addEventListener('DOMContentLoaded', () => {

    const sendButton = document.querySelector("#send_message");
    const inputMessage = document.querySelector("#user_message");
    // const channels = document.querySelector("#channels");
    const createChannelBtn = document.querySelector("#create_channel_btn");
    const newChannelName = document.querySelector("#new_channel_name");
    var activeChannel = localStorage.getItem("activeChannel");

    sendButton.disabled = true;
    createChannelBtn.disabled = true;

    // if(!activeChannel){
    //     channels.firstElementChild.classList.add("active");
    //     activeChannel = localStorage.setItem("activeChannel", document.querySelector(".active").value);
    //     console.log(activeChannel);
    // }
    


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

    newChannelName.onkeyup = () => {

        if (newChannelName.value.length > 0){
            createChannelBtn.disabled = false;
            const warningMessgae = document.querySelector('#channelHelp');
            warningMessgae.style.visibility = "hidden";

        }else{
            createChannelBtn.disabled = true;
        }
    }



});