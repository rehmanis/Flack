
$(document).ready(function() {

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

                    var newItem = "<li><a href='#'>" + value + "</a></li>";
                    $('#channels').append(newItem);
                    $('#createChannelModal').modal('hide');
                    channelCreated = true;
    
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
            'mouseeleave': function (e) {
            $(this).tooltip('hide');
        }
    }, '#num_users a');


});