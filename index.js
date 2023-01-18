const express = require('express');
const session = require('express-session');
const app = express();
const fs = require('fs')
const bcrypt = require('bcrypt');  
const path = require('path');


function dajNastavnike() {
    const buffer = fs.readFileSync('public/data/nastavnici.json');
    return (JSON.parse(buffer));
}

function dajPrisustva(predmet) {
    const buffer = fs.readFileSync('public/data/prisustva.json');
    return (JSON.parse(buffer).find(item => item["predmet"] == predmet));
}

function azurirajPrisustva(predmet, index, { sedmica, predavanja, vjezbe }) {

    prisustva = dajPrisustva(predmet);
    pronadeno = false;
    prisustva["prisustva"].forEach(function (item, i) {

        if (item["index"] == index && item["sedmica"] == sedmica) {
            prisustva["prisustva"][i]["predavanja"] = predavanja;
            prisustva["prisustva"][i]["vjezbe"] = vjezbe;
            pronadeno = true;
        }

    });
    if (!pronadeno) {
        number = parseInt(index);
        prisustva["prisustva"].push({
            "sedmica": sedmica,
            "predavanja": predavanja,
            "vjezbe": vjezbe,
            "index": number
        })
    }
    const buffer = fs.readFileSync('public/data/prisustva.json');
    svaPrisustva = JSON.parse(buffer);
    svaPrisustva[svaPrisustva.findIndex(item => item["predmet"] == predmet)] = prisustva;
    fs.writeFileSync('public/data/prisustva.json', JSON.stringify(svaPrisustva, null, 4));
    
    return dajPrisustva(predmet);
}

app.use(session({
    secret: 'Fipilinaaci',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());

app.use(express.static('public'))

app.get('/:namepage.html', function (req, res) {
    const namepage = req.params.namepage;
    res.sendFile(path.join(__dirname, 'public', 'html', `${namepage}.html`));
});

app.post('/login', function (req, res) {
    var login = req.body;
    var nastavnici = dajNastavnike();
    nastavnici.forEach((element) => {
        if (element["nastavnik"]["username"] == login["username"] &&
            bcrypt.compareSync(login["password"], element["nastavnik"]["password_hash"])) {
            req.session.data = Object();
            req.session.data["logged"] = true;
            req.session.data["username"] = login["username"];
            req.session.data["predmeti"] = element["predmeti"];
        }
    });
    if (req.session.data)
        return res.send(JSON.stringify({ "poruka": "Uspjesna prijava" }));

    else
        return res.status(400).send(JSON.stringify({"poruka":"Neuspjesna prijava"}));

});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.send(); 
});
app.get('/predmet/:naziv', function (req, res) { 
    if (req.session.data && req.session.data["logged"] &&
        req.session.data.predmeti.includes(req.params.naziv)) {
        res.send(JSON.stringify(dajPrisustva(req.params.naziv)));
    }
    else
        res.status(403).send();
});

app.get('/predmeti', function (req, res) {
    if (req.session.data && req.session.data["logged"])
        res.send(JSON.stringify(req.session.data["predmeti"]));
    else
        res.status(403).send(JSON.stringify({ "greska": "Nastavnik nije loginovan" }));

});

app.post('/prisustvo/predmet/:naziv/student/:index', function (req, res) {
    
    if (req.session.data && req.session.data["logged"] &&
        req.session.data.predmeti.includes(req.params.naziv))
        res.send(azurirajPrisustva(req.params.naziv, req.params.index, req.body));
    else
        res.status(403).send();
});

app.listen(3000, () => console.log('Server running at http://localhost:3000/'));
