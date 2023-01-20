const Sequelize = require("sequelize");
const sequelize = require("./database.js");

module.exports = function (sequelize, DataTypes) {
    const PredmetStudent = sequelize.define('predmetstudent', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        predmetId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        freezeTableName: true
    });
    return PredmetStudent;
}
