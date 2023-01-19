    const Sequelize = require("sequelize");


    const sequelize = new Sequelize("wt22", "root", "password", {
        host: "localhost",
        dialect: "mysql",
        logging: false
    });
    const db = {};
    db.Sequelize = Sequelize;
    db.sequelize = sequelize;
    
    db.Student = require('./student.js')(sequelize);
    db.Prisustvo = require('./prisustvo.js')(sequelize);
    db.Predmet = require('./predmet.js')(sequelize);
    db.Nastavnik = require('./nastavnik.js')(sequelize);

db.Predmet.belongsTo(db.Nastavnik, { as: 'nastavnici', foreignKey: 'nastavnikId' });
db.Prisustvo.belongsTo(db.Student, { as: 'studenti', foreignKey: 'studentId' });
db.Prisustvo.belongsTo(db.Predmet, { as: 'predmeti', foreignKey: 'predmetId' });
    module.exports = db;