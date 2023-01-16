
function checkLogin(event) {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    PoziviAjax.postLogin(username, password, function (status, data) {
        
            if (status) {
                document.getElementById("message").innerHTML = data.poruka;
                setTimeout(function () {
                    window.location = "/predmeti.html";
                }, 1000);
            } else {
                document.getElementById("message").innerHTML = data.poruka;
            }
        
    });

}
