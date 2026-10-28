const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Application', {
    id: {type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    careerId: {type:DataTypes.INTEGER, allowNull:true, field:'career_id'},
    position: {type:DataTypes.STRING(255), allowNull:false},
    direction: {type:DataTypes.STRING(120), allowNull:false},
    name: {type:DataTypes.STRING(100), allowNull:false},
    email: {type:DataTypes.STRING(150), allowNull:false},
    phone: DataTypes.STRING(30),
    city: DataTypes.STRING(80),
    experience: DataTypes.STRING(80),
    profile: {type:DataTypes.TEXT, allowNull:false},
    consentAt: {type:DataTypes.DATE, allowNull:false, field:'consent_at'},
    resumeFile: {type:DataTypes.STRING(80), field:'resume_file'},
    resumeName: {type:DataTypes.STRING(255), field:'resume_name'},
    status: {type:DataTypes.INTEGER, allowNull:false, defaultValue:0}
}, {tableName:'job_applications', timestamps:true, underscored:true, charset:'utf8mb4', collate:'utf8mb4_unicode_ci'});
