const Sequelize = require("sequelize");
const { Student } = require("./database.js");
const sequelize = require("./database.js");

module.exports = function (sequelize, DataTypes) {
    const Prisustvo = sequelize.define('prisustva', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sedmica: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        predavanja: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        vjezbe: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'studenti',
                key: 'id'
            }
            
        },
        predmetId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'predmeti',
                key: 'id'
            }

        }
    }, {
        freezeTableName: true
    });
    
    return Prisustvo;
}
