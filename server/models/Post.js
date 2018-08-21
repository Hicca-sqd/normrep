//моделька поста
const mongoose = require( 'mongoose' )
const PostSchema = mongoose.Schema( { //чтобы создать модель надо записать что там будет хсема с помощью монгуса
	title: String, //свойство - тип
	content: String,
	author: String,
	date: {
		type: Date,
		default: Date.now
	},
	link: String,
	comments: [ {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment'
	} ],
	liked_users: [
	{
	type: mongoose.Schema.Types.ObjectId,
	ref: 'User'		
		}
	]
} )
module.exports = mongoose.model( 'Post', PostSchema ) //создание таблицы в базе пост сверху описание структуры как элемента