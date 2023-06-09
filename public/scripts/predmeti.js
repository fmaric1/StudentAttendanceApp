PoziviAjax.getPredmeti(async function (status, data) {
    var list = document.getElementById("menu");
    for (let i = 0; i < data.length; i++) {
        let member = data[i];
        let newItem = document.createElement("li");
        let link = document.createElement("a");
        link.innerHTML = member;
        link.href = "#";
        link.onclick = function () {
            let naziv = this.innerHTML;
            PoziviAjax.getPredmet(naziv, function (status, data) {
                
                if (status) {
                    ispod = document.getElementById("ispod");
                    ispod.innerHTML = "";
                    ispod.innerHTML = "<h2 id=\"predmet\">Predmet: " + naziv + "</h2>";
                    prisustvo = TabelaPrisustvo(ispod, data,naziv);
                    
                    trenutnaSedmica = parseInt(document.getElementById("ispod").classList.item(0).slice(2));
                    zadnjaSedmica = parseInt(document.getElementById("ispod").classList.item(1).slice(2));

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
