$(window).on("load", function() {

    $('[data-toggle="tooltip"]').tooltip()

    var channelCreated = false;
    // var activeChannel = localStorage.getItem("activeChannel");
    
    // if(!activeChannel){
    //     $("#channels").firstElementChild.classList.add("active");
    //     activeChannel = localStorage.setItem("activeChannel", $(".active").value);
    //     console.log(activeChannel);
    // }



    
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

});