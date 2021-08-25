const Errors = require('../lib/errors')

module.exports = (sequelize, DataTypes) => {
	let Notification = sequelize.define('Notification', {
		interacted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		read: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		type: DataTypes.ENUM('mention', 'thread update', 'reply') 
	})

	Notification.filterMentions = function (mentions) {
		//If mentions is not an array of strings
		if(!Array.isArray(mentions) || mentions.filter(m => typeof m !== 'string').length) {
			throw Errors.sequelizeValidation(sequelize, {
				error: 'mentions must be an array of strings',
				value: mentions
			})
		}

		return mentions.filter((mention, pos, self) => {
			return self.indexOf(mention) === pos
		})
	}
	
	//Props fields: userFrom, usernameTo, post, type
	Notification.createPostNotification = async function (props) {
		let { PostNotification, User, Post } = sequelize.models

		let userTo = await User.findOne({ where: { username: props.usernameTo } })
		if(!userTo) return null
		
		let notification = await Notification.create({ type: props.type })
		let postNotification = await PostNotification.create()

		await postNotification.setUser(props.userFrom)
		await postNotification.setPost(props.post)

		await notification.setPostNotification(postNotification)
		await notification.setUser(userTo)

		let reloadedNotification = await notification.reload({
			include: [{
				model: PostNotification,
				include: [Post, { model: User, attributes: ['createdAt', 'username', 'color'] }]
			}]
		})

		return reloadedNotification
	}

	Notification.associate = function (models) {
		Notification.hasOne(models.PostNotification)
		Notification.belongsTo(models.User)
	}

	Notification.prototype.emitNotificationMessage = async function (ioUsers, io) {
		let User = sequelize.models.User
		let user = await User.findById(this.UserId)
		
		if(ioUsers[user.username]) {
			console.log(ioUsers)
			io.to(ioUsers[user.username])
				.emit('notification', this.toJSON())
		}
	}

	return Notification
}