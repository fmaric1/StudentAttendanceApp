const Sequelize = require("sequelize");
const sequelize = require("./database.js");

module.exports = function (sequelize, DataTypes) {
    const Student = sequelize.define('studenti', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        indeks: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });
    
    return Student;
}
