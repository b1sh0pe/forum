module.exports = (sequelize, DataTypes) => {
	let PostNotification = sequelize.define('PostNotification', {})

	PostNotification.associate = function (models) {
		PostNotification.belongsTo(models.User)
		PostNotification.belongsTo(models.Post)
		PostNotification.belongsTo(models.Notification)
	}

	return PostNotification
}