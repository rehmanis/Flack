$(window).on("load", function() {

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
                        console.log(data);
                        var newItem = "<li><a href='#'>" + value + "</a></li>";
                        $('#channels').append(newItem);
                        $('#createChannelModal').modal('hide'); 
     
                    }else{
                        console.log(data);
                        console.log('error');
                        console.log($('#channelHelp'));
                        $('#channelHelp').css("visibility", "visible");
                    }

                }
            });
        });

        $('#createChannelModal').on('shown.bs.modal', function () {
            $('#new_channel_name').focus();
        })

});