const express = require('express');
const session = require('express-session');
const app = express();
const fs = require('fs')
const bcrypt = require('bcrypt');  
const path = require('path');
const Sequelize = require('sequelize');
const mysql = require('mysql');
const db = require('../wt22p18556/public/scripts/database.js');
const nastavnik = require('./public/scripts/nastavnik.js');
const student = require('./public/scripts/student.js');
const predmet = require('./public/scripts/predmet.js');
const prisustvo = require('./public/scripts/prisustvo.js');

function dajNastavnike() {
    const buffer = fs.readFileSync('public/data/nastavnici.json');
    return (JSON.parse(buffer));
}

function dajPrisustvaSva() {
    const buffer = fs.readFileSync('public/data/prisustva.json');
    return (JSON.parse(buffer));
}

function dajPrisustva(predmet) {
    const buffer = fs.readFileSync('public/data/prisustva.json');
    return (JSON.parse(buffer).find(element => element.predmet == predmet));
}

function removeDuplicates(arr, prop) {
    return arr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

function dajStudente() {
    const buffer = fs.readFileSync('public/data/prisustva.json');
    prisustva = JSON.parse(buffer);
    const arr = [];
    for (let i = 0; i < prisustva.length; i++) {
        for (let j = 0; j < prisustva[i].studenti.length; j++) {
            arr.push({
                ime: prisustva[i].studenti[j].ime,
                indeks: prisustva[i].studenti[j].index
            });
        }
        
    }
    return removeDuplicates(arr, 'indeks');
}
function azurirajPrisustva(predmet, index, { sedmica, predavanja, vjezbe }) {

    listaPrisustva = dajPrisustva(predmet);
    pronadeno = false;
    listaPrisustva.prisustva.forEach(function (element, i) {

        if (element.index == index && element.sedmica == sedmica) {
            listaPrisustva.prisustva[i].predavanja = predavanja;
            listaPrisustva.prisustva[i].vjezbe = vjezbe;
            pronadeno = true;
        }

    });
    if (!pronadeno) {
        number = parseInt(index);
        listaPrisustva.prisustva.push({
            "sedmica": sedmica,
            "predavanja": predavanja,
            "vjezbe": vjezbe,
            "index": number
        })
    }
    const buffer = fs.readFileSync('public/data/prisustva.json');
    svaPrisustva = JSON.parse(buffer);
    svaPrisustva[svaPrisustva.findIndex(item => item.predmet == predmet)] = listaPrisustva;
    fs.writeFileSync('public/data/prisustva.json', JSON.stringify(svaPrisustva, null, 4));
    
    return dajPrisustva(predmet);
}

function ubaciPodatkeIzJSON() {
    nastavnici = dajNastavnike();
    predmetiArr = [];
    nastavniciArr = [];
    studentiArr = [];
    for (let i = 0; i < nastavnici.length; i++) {

        db.Nastavnik.create({
            username: nastavnici[i].nastavnik.username,
            password_hash: nastavnici[i].nastavnik.password_hash
        });
        id = i + 1;
        nastavniciArr.push({
            id: id,
            nastavnik: nastavnici[i].nastavnik.username
        });
        for (let j = 0; j < nastavnici[i].predmeti.length; j++) {
            id = j + 1;
            predmetiArr.push({
                id : id,
                predmet: nastavnici[i].predmeti[j],
                nastavnik: nastavnici[i].nastavnik.username
            })
        }
    }
        studenti = dajStudente();
        for (let i = 0; i < studenti.length; i++) {
            db.Student.create({
                ime: studenti[i].ime,
                indeks: studenti[i].indeks
            });
            studentid = i + 1;
            studentiArr.push({
                id: studentid,
                indeks: studenti[i].indeks
            })
        }
    prisustva = dajPrisustvaSva();
        for (let i = 0; i < prisustva.length; i++) {
            user = predmetiArr[predmetiArr.findIndex(item => item.predmet == prisustva[i].predmet)].nastavnik;
            nastavnikid = nastavniciArr[nastavniciArr.findIndex(item => item.nastavnik == user)].id;
            predmetid = i + 1;
            
            db.Predmet.create({
                predmet: prisustva[i].predmet,
                brojPredavanjaSedmicno: prisustva[i].brojPredavanjaSedmicno,
                brojVjezbiSedmicno: prisustva[i].brojVjezbiSedmicno,
                nastavnikId: nastavnikid
            });
            
    }
    for (let i = 0; i < prisustva.length; i++) {
        for (let j = 0; j < prisustva[i].prisustva.length; j++) {
            predmetid2 = predmetiArr[predmetiArr.findIndex(item => item.predmet == prisustva[i].predmet)].id;
            studentid2 = studentiArr[studenti.findIndex(item => item.indeks == prisustva[i].prisustva[j].index)].id;

            db.Prisustvo.create({
                sedmica: prisustva[i].prisustva[j].sedmica,
                predavanja: prisustva[i].prisustva[j].predavanja,
                vjezbe: prisustva[i].prisustva[j].vjezbe,
                studentId: studentid2,
                predmetId: predmetid2
            });

        }
    }
    


    
}




var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'wt22'
});

pool.getConnection(function (error, connection) {
    if (error) throw error;
    console.log('Connected');
});
//kreira tabele u bazi, ako vec postoje prvo ih dropa
db.sequelize.sync({ force: true })
    .then(() => {
        console.log('Tables created or already exist')
        ubaciPodatkeIzJSON();
    })
    .catch(err => {
        console.error('Error while creating tables:', err)
    });
//unosi podatke iz nastavnici.json i prisustva.json


app.use(session({
    secret: 'Fipilinaaci',
    resave: true,
    saveUninitialized: true
}));

app.use(express.json());

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.get('/:namepage.html', function (req, res) {
    const namepage = req.params.namepage;
    res.sendFile(path.join(__dirname, 'public', 'html', `${namepage}.html`));
});

app.post('/login', function (req, res) {
    var login = req.body;
    predmeti2 = [];
    db.Nastavnik.findOne({
        where: {
            username: login.username
        }
    }).then(nastavnik => {
        if (nastavnik && bcrypt.compareSync(login.password, nastavnik.password_hash)) {
            
            db.Predmet.findAll({
                where: {
                    nastavnikId: nastavnik.id
                }
            }).then(predmeti => {
                let predmetiArray = []
                for (let i = 0; i < predmeti.length; i++) {
                    predmetiArray.push(predmeti[i].dataValues.predmet);
                }
                console.log(predmetiArray);
                req.session.data = Object();
                req.session.data.logged = true;
                req.session.data.username = login.username;
                req.session.data.predmeti = predmetiArray;
                console.log(req.session.data);
                res.json({ "poruka": "Uspjesna prijava" });
            });



           
        }
        else
            res.status(400).json({ "poruka": "Neuspjesna prijava" });

    }).catch(err => {
        console.log(err);
        res.send({ "poruka": "Neuspjesna prijava" });
    });
    /*
    var nastavnici = dajNastavnike();
    nastavnici.forEach((element) => {
        if (element.nastavnik.username == login.username &&
            bcrypt.compareSync(login.password, element.nastavnik.password_hash)) {
            req.session.data = Object();
            req.session.data.logged = true;
            req.session.data.username = login.username;
            req.session.data.predmeti = element.predmeti;
        }
    });
    if (req.session.data)
        return res.send(JSON.stringify({ "poruka": "Uspjesna prijava" }));

    else
        return res.status(400).send(JSON.stringify({"poruka":"Neuspjesna prijava"}));
        */
});

app.post('/logout', function (req, res) {
    req.session.destroy();
    res.send(); 
});
app.get('/predmet/:naziv', function (req, res) {
    if (req.session.data && req.session.data.logged &&
        req.session.data.predmeti.includes(req.params.naziv)) {
        res.send(JSON.stringify(dajPrisustva(req.params.naziv)));
    }
    else
        res.status(403).send();
});

app.get('/predmeti', function (req, res) {
    if (req.session.data && req.session.data.logged)
        res.send(JSON.stringify(req.session.data.predmeti));
    else
        res.status(403).send(JSON.stringify({ "greska": "Nastavnik nije loginovan" }));

});

app.post('/prisustvo/predmet/:naziv/student/:index', function (req, res) {
    
    if (req.session.data && req.session.data.logged &&
        req.session.data.predmeti.includes(req.params.naziv))
        res.send(azurirajPrisustva(req.params.naziv, req.params.index, req.body));
    else
        res.status(403).send();
});

app.listen(3000, () => console.log('Server running at http://localhost:3000/'));
