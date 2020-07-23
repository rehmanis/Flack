function addUsersOptions(){

    var isUpdated = false;
    const activeChannelUsers = JSON.parse(localStorage.getItem("activeChannelUsers"));
    const users = $("#get_all_users").data("users");

    $("#users_to_add_selected").html("");

    for (var i = 0; i < users.length; i++){

        if (!activeChannelUsers.includes(users[i])){
            $("#users_to_add_selected").append("<option>" + users[i] + "</option>");
            $('#users_to_add_selected').selectpicker('refresh');
            isUpdated = true;
        }
    }
    
    return isUpdated;
}

// update the tooltip for user addd button for the active channel. If all users are already
// added to the active channel, then it disables the button to add more users
function updateUserTooltip() {

    // add user options in multiselect dropdown in the modal that pops up when add user button
    // is pressed. If no users is added, i.e addUsersOptions() returns false, then disable the 
    // add user button and update the tooltip
    if (!addUsersOptions()){

        $("#add_users span").prop("disabled", true);
        $("#add_users_btn").prop("disabled", true);
        $("#add_users_btn_wrapper").attr('data-original-title', "All users already in this channel");
    }else{

        $("#add_users span").prop("disabled", false);
        $("#add_users_btn").prop("disabled", false);
        $("#add_users_btn_wrapper").attr('data-original-title', "Click to add users");
    }
}

function getUsersInChannel(){
    const users = JSON.parse(localStorage.getItem("activeChannelUsers"));
    let text = "<p>This channel has users:"
    
    for (var i = 0; i < users.length; i++){
        text += "<br>" + users[i]
    }

    text += '<\p>';
    return text;

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