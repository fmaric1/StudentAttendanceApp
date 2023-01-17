PoziviAjax.getPredmeti(function (status, data) {
    var list = document.getElementById("menu");
    for (let i = 0; i < data.length; i++) {
        let member = data[i];
        let newItem = document.createElement("li");
        let link = document.createElement("a");
        link.innerHTML = member;
        link.href = "#";
        let naziv = member;
        link.onclick = function () {
            let naziv = this.innerHTML;
            PoziviAjax.getPredmet(naziv, function (status, data) {
              
                if (status) {
                    trenutnaSedmica = 2;
                    zadnjaSedmica = 2;
                    prisustvo = TabelaPrisustvo(document.getElementById("ispod"), data);

                }
                

            });
        }
        newItem.appendChild(link);
        list.appendChild(newItem);
    }

    let nav = document.getElementById("nav");
    let button = document.createElement("button");
    button.id = "logout-button";
    button.innerHTML = "Logout";
    button.onclick = function () {
        PoziviAjax.postLogout(function (status, data) {
            if (!status);
            window.location="/prijava.html"
        });
    }
    nav.appendChild(button);

});
