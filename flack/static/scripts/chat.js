$(document).ready(function() {

    // initialize some global variables
    // const channels = $("#channels");
    var activeChannelName = localStorage.getItem("activeChannelName");
    var activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));
    const sendButton = $("#send_message");
    const inputMessage = $("#user_message");
    const newChannelName = $("#new_channel_name");
    const users = $("#get_all_users").data("users");


    // update the active channel information to be displayed. If no active channel stored in the
    // local storage then save and show the general channel
    updateChannelDisplay();
    
    // update the header to display the active channel
    document.querySelector("#curr_channel").firstElementChild.innerHTML = "#" + activeChannelName;
    // make an ajax request to get the channel messages and current users in this channel and
    // update the display accordingly
    console.log(activeChannelName);
    getMessages(activeChannelName);
    // since nothing is typed this moment, make sure to prevent sending message
    sendButton.disabled = true;

    // allow enter to result in sending message only if the typed message is not empty
    inputMessage.onkeyup = () => {
    
        if (inputMessage.value.length > 0)
            sendButton.disabled = false;
        else
            sendButton.disabled = true;

        if (inputMessage.value.length > 0 && event.keyCode === 13){
            sendButton.click();
        }
    };

    // 
    newChannelName.onkeyup = () => {

        if (newChannelName.value.length > 0){
            createChannelBtn.disabled = false;
            const warningMessgae = document.querySelector('#channelHelp');
            warningMessgae.style.visibility = "hidden";

        }else{
            createChannelBtn.disabled = true;
        }
    }



    // make the clicked channel to be active one, calling ajax request to retrieve the 
    // message for selected channel. Update tooltips and disable the user button if all 
    // users are already in this channel
    $('#channels').on("click", function(event) {

        if (event.target && (event.target.nodeName == "A" || event.target.nodeName == "LI")){

            // console.log(event.target);
            // console.log(event.target.nodeName);
            // console.log(event.target.id);
            // console.log(event.target.parentNode);
            // console.log(event.target.parentNode.parentNode.innerHTML);
            // console.log(event.target.id == "leave");
            var parentElem = $(event.target.parentNode);
            console.log(parentElem.data("channel"));


            if (event.target.id == "leave"){

                leaveChannel(parentElem.data("channel"));
                // ajax request to leave the group
            }else if (event.target.id == "delete"){

            }else{

                let activeChannel = document.querySelector("li.active");
                activeChannel.classList.remove("active");
    
                if (event.target.nodeName == "A"){
                    event.target.parentNode.classList.add("active");
                }else{
                    event.target.classList.add("active");
                }
    
                activeChannelName = localStorage.getItem("activeChannelName");
                channelSelected = (event.target.innerText || event.target.textContent);
                console.log(channelSelected);
                console.log(channelSelected.length);
    
                
                if (activeChannelName != channelSelected){
                    console.log(activeChannelName);
                    localStorage.setItem("activeChannelName", channelSelected);        
                    document.querySelector("#curr_channel").firstElementChild.innerHTML = "#" + channelSelected;
                    getMessages(channelSelected);
                    activeChannelName = channelSelected;
    
                }
    
                document.querySelector("#user_message").focus();
            }


        }

    });



    // if active channel name or channel users have not yet being stored (i.e first time running the script)
    // set it to the first channel in list of channels (the channel "#general")
    // else set the active channel from the stored one and update the count of users in this channel
    function updateChannelDisplay() {

        if (!activeChannelName || !activeChannelUsers){

            $("#channels").children(":first").addClass("active");
            localStorage.setItem("activeChannelName", $("li.active a").html());
            activeChannelName = localStorage.getItem("activeChannelName");
            localStorage.setItem("activeChannelUsers", JSON.stringify(users));
            activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers")); 
            
        }else{
            // console.log("here");
            // console.log(("#" + activeChannelName));

            // // console.log(("#" + activeChannelName));
            // console.log($("#" + activeChannelName));
            $($("#" + activeChannelName)).addClass("active");    
            $("#num_users a span").html(activeChannelUsers.length);
        }

    }


    // create the appropriate html to display the message based on the dictionary data
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

    function leaveChannel(channel){
        $.ajax({
            url: 'chat/leave_channel',
            type: 'POST',
            data: JSON.stringify({ "channel" : channel } ),
            contentType: "application/json; charset=utf-8",
            dataType: "json",

            success: function(data){
                if(data.success){
                    if (activeChannelName === data.channel){
                        $("#" + data.channel).removeClass("active");
                        const nextChannel = $("#" + data.channel).next()
                        console.log(nextChannel);
                        console.log(nextChannel.html());
                        console.log(($.isEmptyObject(nextChannel)));
                        console.log($("#" + data.channel).prev());
                        const nextActiveChannel = (nextChannel.length === 0) ? $("#" + data.channel).prev() : nextChannel;
                        console.log(nextActiveChannel);
                        localStorage.setItem("activeChannelName", nextActiveChannel.children("a").html());
                        activeChannelName =  localStorage.getItem("activeChannelName");
                        $($("#" + activeChannelName)).addClass("active"); 
                        console.log(activeChannelName);

                        // delete the channel from 
                        $("#" + data.channel).remove();

                        // send a user left event to other users in the channel



                    }
                    
                }else{

                }

            }
        });        
    }

    function getMessages(channel){

        $.ajax({
            url: 'messages',
            type: 'POST',
            data: JSON.stringify({ "channel" : channel } ),
            contentType: "application/json; charset=utf-8",
            dataType: "json",

            success: function(data){
                if(data.success){
                    $("#message_section").html("");

                    for (var i = 0; i < data.entries.length; i++){
                        displayMessage(data.entries[i]);
                        console.log(data.entries[i]);
                    }

                    localStorage.setItem("activeChannelUsers", JSON.stringify(data.users));
                    activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));
                    $("#num_users a span").html(activeChannelUsers.length);
                    updateUserTooltip();
    
                }else{

                    console.log('ERROR');

                }

            }
        });
        
    }

});
