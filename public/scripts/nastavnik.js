const Sequelize = require("sequelize");
const sequelize = require("./database.js");


module.exports = function (sequelize, DataTypes) {
    const Nastavnik = sequelize.define('nastavnici', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password_hash: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });
    return Nastavnik;
}
