$(document).ready(function() {


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    // // const channels = document.querySelector("#channels");
    // const sendButton = document.querySelector("#send_message");

    // When user is connected connected, 
    socket.on("connect", () => {

        socket.emit("client connected", {"username": username});

    });

    // When user is added to new channel.

    // socket.on("user joined channel", data =>{

    // });

    socket.on("message", data => {
        const activeChannelName = localStorage.getItem("activeChannelName");
        console.log("message received");
        if (activeChannelName === data.room){
            $("#message_section").animate({ scrollTop: $('#message_section').prop("scrollHeight")}, 700);
            displayMessage(data);
        }else{
            // add a bubble next to channel to indicate unread message in visible
            // channels
        }

    });

    $("#send_message").on('click', function(e) {

        const activeChannelName = localStorage.getItem("activeChannelName");

        console.log(activeChannelName)
        const inputMessage = document.querySelector("#user_message");
        socket.send({"username": username, "room": activeChannelName, "msg" : inputMessage.value});
        inputMessage.value = "";
        sendButton.disabled = true;
    });


    $('[data-toggle="tooltip"]').tooltip({
        html: true
    })

    $('select').selectpicker();
    
    var channelCreated = false;
    
    $('#create_channel_form').on('submit', function(e){
        e.preventDefault();
        var value = $("#new_channel_name").val();

        $.ajax({
            url: 'chat/create_channel',
            type: 'POST',
            data: JSON.stringify({ "channel" : value } ),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                if(data.success){

                    var newItem =  '<li id="' + value + '"><a href="#">' + value + '</a> \
                                        <div class="remove-channel btn-group dropright"> \
                                            <button type="button" class="btn remove-channel-btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> \
                                                <i class="fa fa-times" aria-hidden="true"></i> \
                                            </button>\
                                            <div class="dropdown-menu" data-channel="'+ value + '"> \
                                                <a class="dropdown-item" id="leave" href="#">leave</a> \
                                                <a class="dropdown-item" id="delete" href="#">delete</a> \
                                            </div> \
                                        </div> \
                                    </li>';    
                    
                    $('#channels').append(newItem);
                    $("#channels li").children("div").hide();
                    $('#createChannelModal').modal('hide');
                    channelCreated = true;
                    socket.emit("join channel", {"channel": value})
    
                }else{

                    $('#channelHelp').css("visibility", "visible");
                }

            }
        });
    });
    
    $('#add_users_form').on('submit', function(e){
        e.preventDefault();
        const selected_users = $("#users_to_add_selected").val();
        const activeChannelName = localStorage.getItem("activeChannelName")
        console.log(selected_users)
        console.log(activeChannelName)
        $.ajax({
            url: 'chat/add_users',
            type: 'POST',
            data: JSON.stringify({ "users" : selected_users, "channel" : activeChannelName } ),
            contentType: "application/json; charset=utf-8",
            dataType: "json",

            success: function(data){
                if(data.success){

                    var currUsers = parseInt($("#num_users a span").html()) + selected_users.length;
                    var activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));
                    localStorage.setItem("activeChannelUsers", JSON.stringify(activeChannelUsers.concat(selected_users)));
                    $("#num_users a span").html(currUsers);
                    updateUserTooltip();
                    $('#addUsersModal').modal('hide');
    
                }else{

                }

            }
        });

    });

    $('#createChannelModal').on('shown.bs.modal', function () {
        $('#new_channel_name').focus();
    });

    $('#createChannelModal').on('hidden.bs.modal', function () {
        console.log("here");
        
        if (channelCreated){
            console.log($("#channels").children().last());
            $("#channels").children().last().trigger("click");
            channelCreated = false;
            // $('#user_message').focus();
        }

    });

    $(document).on({

        'mouseenter': function (e) {
            const text = getUsersInChannel();
            $("#num_users a").attr('data-original-title', text);
            $(this).tooltip('show');
        },

        'mouseleave': function (e) {
            $(this).tooltip('hide');
        }

    }, '#num_users a');



    // $(".remove-channel-btn").hide();
    // $(".remove-channel-btn").children().hide();

    // $("#channels li").children("button").hide();
    // $("#channels li").children("button").children().hide();
    $("#channels li").children("div").hide();
    
    $("#channels").on({

        'mouseenter': function (e) {
            console.log("enter");
            $(this).children("div").show();
            // $(this).children("button").show();
            // $(this).children("button").children().show();

        },

        'mouseleave': function (e) {
            console.log("leave");
            $(this).children("div").hide();
            // $(this).children("button").hide();
            // $(this).children("button").children().hide();
        }

    }, 'li');


});