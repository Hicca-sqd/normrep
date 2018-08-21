const express = require( 'express' )
const multer = require( 'multer' ) // npm install --save multer
const upload = multer( {
	dest: 'uploads/'
} )
const fs = require( 'fs' )
const path = require( 'path' )
const router = express.Router() //все
const asyncMiddleware = require('../async')
const Post = require( '../models/Post' ) //подключение модели 
const Comment = require( '../models/Comment' )
const redis = require( 'redis' )

const client = redis.createClient()
client.on('error', (err) => console.log(`Error: ${err}`))

/*что-то записать client.set 1 
1) ключ client.set('mykey', 'myver') 1 = 2

client.get('mykey', () =>{})
*/

router.get('/search/:search_text', asyncMiddleware(async(req, res, next) =>{
	const myRegExp = new RegExp(`${req.params.search_text}`, 'i')
	let result = await Post.find({
		$or: [
		{title:myRegExp},
		{content:myRegExp}
		]
	}).limit(5).exec()
	res.send(result)
}))
// var post = new Post({
// 	title: 'Title 1',
// 	content: 'Content 1',
// 	author: 'Author 1'
// })
// post.save((err, post) =>{
// 	if(err) return console.log(err)
// 	console.log(post)
// })
// console.log(post)
//подключаем все роуты
router.get( '/home/:page', ( req, res, next ) => {
	Post.find()
		.skip((req.params.page - 1) * 5)
		.limit(5)
		.exec( ( err, posts ) => {
			if ( err ) return res.send( err );
			Post.count().exec((err, count) => {
				if( err ) return res.send( err )
				res.send({ posts: posts, count: count })
			})
		} )
} )

router.get( '/:id', ( req, res, next ) => {
	client.get(req.params.id, (err, post)=>{
		if(err) return res.send(err)
			if(post){
				res.send(JSON.parse(post))
					console.log('redis')
			} else{
			Post.findById( req.params.id )
				// .populate( 'comments' ) // т.е указали название свойства находит в Коментс находит по айди коменты
				.exec( ( err, post ) => {
			if ( err ) return res.send( err )
				client.set(req.params.id, JSON.stringify(post), redis.print)
			res.send( post )
			console.log('Mongo')
		} )
			}
	})

} )

router.post( '/', upload.single( 'file' ), ( req, res, next ) => { //отправка изображения
	var post = new Post( {
		title: req.body.title,
		content: req.body.content,
		author: req.body.author
	} )
	let tempPath = req.file.path;
	let targetPath = path.resolve(
		`public/uploads/${post._id}.${req.file.originalname.split('.').pop()}` )
	fs.rename( tempPath, targetPath, ( err ) => {
		if ( err ) return res.send( err )
		post.link = `/uploads/${post._id}.${req.file.originalname.split('.').pop()}`
		post.save( ( err, post ) => {
			if ( err ) return res.send( err )
			res.send( post )
		} )
	} )
} )
router.delete( '/:id', ( req, res, next ) => {
	Post.remove( {
			_id: req.params.id
		} )
		.exec( ( err, result ) => {
			if ( err ) return res.send( err )
			res.send( 200 )
		} )
} );
router.put( '/', ( req, res, next ) => {
	Post.findById( req.body._id )
		.exec( ( err, post ) => {
			if ( err ) {
				res.status( 500 )
					.send( err );
			} else {
				post.title = req.body.title;
				post.content = req.body.content;
				post.author = req.body.author;
				post.save( ( err, result ) => {
					if ( err ) {
						res.status( 500 )
							.send( err );
					} else {
						res.status( 200 )
							.send( result );
					}
				} );
			}
		} );
} );

router.put('/like/:id', asyncMiddleware(async (req, res, next) => {
	if(req.user){
	var post = await Post.findById(req.params.id).exec()
	var index = post.liked_users.indexOf(req.user._id)
	if(index >= 0) {
		post.liked_users = post.liked_users.filter((user) => user != `${req.user._id}`) //проходит по массиву
	} else{
		post.liked_users.push(req.user._id)
	}
	post.save((err, post) =>{
		if(err) res.send(err)
		res.send(post)
	})
	} else{
		res.send(401)
	}
}))
module.exports = router //экспорт переменной