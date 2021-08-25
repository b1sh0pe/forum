let sharp = require('sharp')

module.exports = (sequelize, DataTypes) => {
	let ProfilePicture = sequelize.define('ProfilePicture', {
		file: DataTypes.BLOB('long'),
		mimetype: DataTypes.STRING
	}, {
		hooks: {
			beforeUpdate (profilePicture, options, cb) {
				sharp(profilePicture.file)
					.resize(300, 300, { fit: 'cover' })
					.toBuffer((err, buff) => {
						profilePicture.file = buff

						cb(err || null, options)
					})
			}
		}
	})

	ProfilePicture.associate = function (models) {
		ProfilePicture.belongsTo(models.User)
	}

	return ProfilePicture
}