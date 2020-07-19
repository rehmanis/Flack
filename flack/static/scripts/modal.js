$(document).ready(function() {

    $('[data-toggle="tooltip"]').tooltip({
        html: true
    })
    
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


    function getUsersInChannel(){
        const users = JSON.parse(localStorage.getItem("activeChannelUsers"));
        let text = "<p>This channel has users:"
        
        for (var i = 0; i < users.length; i++){
            text += "<br>" + users[i]
        }

        text += '<\p>';
        return text;

    }


});