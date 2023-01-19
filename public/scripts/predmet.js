const Sequelize = require("sequelize");
const sequelize = require("./database.js");

module.exports = function (sequelize, DataTypes) {
    const Predmet = sequelize.define('predmeti', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        predmet: {
            type: Sequelize.STRING,
            allowNull: false
        },
        brojPredavanjaSedmicno: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        brojVjezbiSedmicno: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        nastavnikId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'nastavnici',
                key: 'id'
            }
            
        }
    }, {
        freezeTableName: true
    });
    return Predmet;
}
