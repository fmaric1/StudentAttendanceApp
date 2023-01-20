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

async function ubaciPodatkeIzJSON() {
    nastavnici = dajNastavnike();
    predmetiArr = [];
    nastavniciArr = [];
    studentiArr = [];
    idPr = 1;
    for (let i = 0; i < nastavnici.length; i++) {

        await db.Nastavnik.create({
            username: nastavnici[i].nastavnik.username,
            password_hash: nastavnici[i].nastavnik.password_hash
        });
        id = i + 1;
        nastavniciArr.push({
            id: id,
            nastavnik: nastavnici[i].nastavnik.username
        });
        for (let j = 0; j < nastavnici[i].predmeti.length; j++) {
            predmetiArr.push({
                id : idPr,
                predmet: nastavnici[i].predmeti[j],
                nastavnik: nastavnici[i].nastavnik.username
            })
            idPr = idPr + 1;
        }
    }
        studenti = dajStudente();
        for (let i = 0; i < studenti.length; i++) {
            await db.Student.create({
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
    for (let i = 0; i < prisustva.length; ) {
            
            user = predmetiArr[predmetiArr.findIndex(item => item.predmet == prisustva[i].predmet)].nastavnik;
            nastavnikid = nastavniciArr[nastavniciArr.findIndex(item => item.nastavnik == user)].id;
            
        await db.Predmet.create({
            predmet: prisustva[i].predmet,
            brojPredavanjaSedmicno: prisustva[i].brojPredavanjaSedmicno,
            brojVjezbiSedmicno: prisustva[i].brojVjezbiSedmicno,
            nastavnikId: nastavnikid
        }).then(i=i+1);
    }
    for (let i = 0; i < prisustva.length; i++) {
        predmetid2 = predmetiArr[predmetiArr.findIndex(item => item.predmet == prisustva[i].predmet)].id;
        
        for (let j = 0; j < prisustva[i].prisustva.length; j++) {
            
            studentid2 = studentiArr[studenti.findIndex(item => item.indeks == prisustva[i].prisustva[j].index)].id;

            await db.Prisustvo.create({
                sedmica: prisustva[i].prisustva[j].sedmica,
                predavanja: prisustva[  i].prisustva[j].predavanja,
                vjezbe: prisustva[i].prisustva[j].vjezbe,
                studentId: studentid2,
                predmetId: predmetid2
            });

           

        }
        for (let j = 0; j < prisustva[i].studenti.length; j++) {
            studentid2 = studentiArr[studenti.findIndex(item => item.indeks == prisustva[i].studenti[j].index)].id;
            await db.PredmetStudent.create({
                predmetId: predmetid2,
                studentId: studentid2

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
/*!!!!!!!!!!!!!!
 * ako imamo popunjenju bazu i zelimo unijeti na novo sve podatke iz nastavnici.json i prisustva.json
 * moramo odkomentarisati parametre u db.sequelize.sync i poziv funckcije ubaciPodatkeIzJSON()
*/
db.sequelize.sync(/*{ force: true }*/)
    .then(() => {
        console.log('Tables created or already exist')
        //ubaciPodatkeIzJSON();
    })
    .catch(err => {
        console.error('Error while creating tables:', err)
    });


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
            
            req.session.data = Object();
            req.session.data.logged = true;
            req.session.data.username = login.username;
          
            res.json({ "poruka": "Uspjesna prijava" });



           
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
    
    if (req.session.data && req.session.data.logged) {
        studentFinal = [];
        prisustvaFinal = [];
        studentArray = [];
        prisustvaArray = [];
        idStudenata = [];
        idStudenataPrisustvo = [];
        db.Student.findAll()
            .then(students => {               
                studentArray = students.map(student => student.dataValues);
                
                db.Predmet.findOne({
                    where: {
                        predmet: req.params.naziv
                    }
                }).then(predmeti => {
                    if (predmeti) {
                        idpredmeta = predmeti.dataValues.id;

                    db.Prisustvo.findAll({
                        where: {
                            predmetId: idpredmeta
                        }
                    }).then(prisustva => {
                        prisustvaArray = prisustva.map(prisustvo => prisustvo.dataValues);

                        db.PredmetStudent.findAll({
                            where: {
                                predmetId: idpredmeta
                            }
                        }).then(x => {
                            studentiIdijevi = x.map(prisustvo => prisustvo.dataValues.studentId);

                            brojP = predmeti.dataValues.brojPredavanjaSedmicno;
                            brojV = predmeti.dataValues.brojVjezbiSedmicno;
                            studentArray.forEach(x => {
                                if (studentiIdijevi.includes(x.id))
                                    studentFinal.push({ "id": x.id, "ime": x.ime, "index": x.indeks });
                            })
                            prisustvaArray.forEach(x => {
                                prisustvaFinal.push({
                                    "id": x.id,
                                    "sedmica": x.sedmica,
                                    "predavanja": x.predavanja,
                                    "vjezbe": x.vjezbe,
                                    "index": studentFinal.find(s => s.id === x.studentId).index
                                });
                            });
                            res.json([{
                                "studenti": JSON.parse(JSON.stringify(studentFinal)),
                                "prisustva": JSON.parse(JSON.stringify(prisustvaFinal)),
                                "brojPredavanjaSedmicno": brojP,
                                "brojVjezbiSedmicno": brojV
                            }])
                        })







                    });
                }
                });
                
            })
        

    }
    else
        res.status(403).send();

    /*if (req.session.data && req.session.data.logged &&
        req.session.data.predmeti.includes(req.params.naziv)) {
        res.send(JSON.stringify(dajPrisustva(req.params.naziv)));
    }
    else
        res.status(403).send();*/
});

app.get('/predmeti', function (req, res) {
    
    if (req.session.data.logged) {
        
        db.Nastavnik.findOne({
            where: {
                username: req.session.data.username
            }
        }).then(nastavnik => {

            db.Predmet.findAll({
                where: {
                    nastavnikId: nastavnik.dataValues.id
                }
            }).then(predmeti => {
                let predmetiArray = []
                for (let i = 0; i < predmeti.length; i++) {
                    predmetiArray.push(predmeti[i].dataValues.predmet);
                }
                res.send(predmetiArray);
            });
        });

        
    }
    else 
        res.status(403).json({ "greska": "Nastavnik nije loginovan" });

    /*if (req.session.data && req.session.data.logged)
        res.send(JSON.stringify(req.session.data.predmeti));
    else
        res.status(403).send(JSON.stringify({ "greska": "Nastavnik nije loginovan" }));*/

});

app.post('/prisustvo/predmet/:naziv/student/:index', async function (req, res) {

    if (req.session.data && req.session.data.logged) {
        try {
            const student = await db.Student.findOne({
                where: {
                    indeks: req.params.index
                }
            });

            const predmet = await db.Predmet.findOne({
                where: {
                    predmet: req.params.naziv
                }
            });

            let prisustvo = await db.Prisustvo.findOne({
                where: {
                    sedmica: req.body.sedmica,
                    predmetId: predmet.id,
                    studentId: student.id
                }
            });

            if (prisustvo) {
                await prisustvo.update({ predavanja: req.body.predavanja, vjezbe: req.body.vjezbe });
            } else {
                prisustvo = await db.Prisustvo.create({
                    sedmica: req.body.sedmica,
                    predavanja: req.body.predavanja,
                    vjezbe: req.body.vjezbe,
                    studentId: student.id,
                    predmetId: predmet.id
                });
            }

            studentFinal = [];
            prisustvaFinal = [];
            studentArray = [];
            prisustvaArray = [];
            idStudenata = [];
            idStudenataPrisustvo = [];
            db.Student.findAll()
                .then(students => {
                    studentArray = students.map(student => student.dataValues);

                    db.Predmet.findOne({
                        where: {
                            predmet: req.params.naziv
                        }
                    }).then(predmeti => {
                        if (predmeti) {
                            idpredmeta = predmeti.dataValues.id;

                            db.Prisustvo.findAll({
                                where: {
                                    predmetId: idpredmeta
                                }
                            }).then(prisustva => {
                                prisustvaArray = prisustva.map(prisustvo => prisustvo.dataValues);

                                db.PredmetStudent.findAll({
                                    where: {
                                        predmetId: idpredmeta
                                    }
                                }).then(x => {
                                    studentiIdijevi = x.map(prisustvo => prisustvo.dataValues.studentId);

                                    brojP = predmeti.dataValues.brojPredavanjaSedmicno;
                                    brojV = predmeti.dataValues.brojVjezbiSedmicno;
                                    studentArray.forEach(x => {
                                        if (studentiIdijevi.includes(x.id))
                                            studentFinal.push({ "id": x.id, "ime": x.ime, "index": x.indeks });
                                    })
                                    prisustvaArray.forEach(x => {
                                        prisustvaFinal.push({
                                            "id": x.id,
                                            "sedmica": x.sedmica,
                                            "predavanja": x.predavanja,
                                            "vjezbe": x.vjezbe,
                                            "index": studentFinal.find(s => s.id === x.studentId).index
                                        });
                                    });
                                    res.json([{
                                        "studenti": JSON.parse(JSON.stringify(studentFinal)),
                                        "prisustva": JSON.parse(JSON.stringify(prisustvaFinal)),
                                        "brojPredavanjaSedmicno": brojP,
                                        "brojVjezbiSedmicno": brojV
                                    }])
                                })







                            });
                        }
                    });

                })
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    }




    /*
    if (req.session.data && req.session.data.logged &&
        req.session.data.predmeti.includes(req.params.naziv))
        res.send(azurirajPrisustva(req.params.naziv, req.params.index, req.body));
    else
        res.status(403).send();*/
});

app.listen(3000, () => console.log('Server running at http://localhost:3000/'));
