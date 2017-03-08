var Article 		= require("../model/article").article
var dbUtils 		= require("../utils/dbUtils")
var tools 		= require("../utils/tools")

function articleDao(type) {

	var dbDriver = "mysql"
	var dbConfig = {
		host		: 'localhost',
		user		: 'root',
		password	: 'tang',
		port		: '3306',
		database	: 'liberate'
	}
	// var connection = dbUtils.getConnection(dbDriver, dbConfig)
	var pool = dbUtils.getConnPool(dbConfig)

	function connect(connection) {
		connection.connect(function(err) {
		  	if (err) {
		    		console.error('error connecting: ' + err.stack)
		    		return;
		  	}
		 
		  	console.log('connected as id ' + connection.threadId)
		});
	}

	function disconnect(connection) {
		connection.end(function(err){
		    	if(err){        
		        		return;
		    	}
		      	console.log('[connection end] succeed!')
		});
	}

	function getArticles(id, article, callback) {
		var _sql = 'SELECT * FROM article'
		var articles = []

		pool.getConnection(function(err, connection) {
			if(err)
				throw err

			// Use the connection 
			connection.query({
					sql : _sql,
					timeout: 40000, // 40s
				}, 
				function (error, results, fields) {
					// And done with the connection. 
					connection.release()
			 
					// Handle error after the release. 
					if (error) throw error
			 
					// Don't use the connection here, it has been returned to the pool. 
					console.log(results)
					if(results && results.length && results.length > 0) {
						var len = results.length
						var _article
						var temp
						for (var i = 0; i < len; i++) {
							temp = results[i]
							_article = new Article(temp.id,
												temp.name,
												temp.content,
												temp.cdate)
							articles.push(_article)
						}
					}
					callback(articles)
				}
			)
		})

		return articles
	}

	function getArticleById(id, article, callback) {
		var _sql = 'SELECT * FROM article where id = ?'
		var _article

		pool.getConnection(function(err, connection) {
			if(err)
				throw err

			// Use the connection 
			connection.query({
					sql : _sql,
					timeout: 40000, // 40s 
				}, 
				[id],
				function (error, results, fields) {
					// And done with the connection. 
					connection.release()
			 
					// Handle error after the release. 
					if (error) throw error
			 
					// Don't use the connection here, it has been returned to the pool. 
					// console.log(results)
					if(results && results.length && results.length  == 1) {
						var temp = results[0]
						_article = new Article(temp.id,
											temp.name,
											temp.content,
											temp.cdate)

					}
					callback(_article)
				}
			)
		})

		return _article
	}

	function addArticle(id, article, callback) {
		var _sql = 'INSERT INTO article SET ?'
		var post  = {
			name:  article.name, 
			content: article.content,
			cdate: article.cdate
		}

		var result = -1
		pool.getConnection(function(err, connection) {
			connection.query(_sql, post, function (error, results, fields) {
				if (error) throw error
			 	// console.log(results)
			 	// console.log(fields) 
			 	if(results){
			 		result = results.affectedRows
			 	}
			 	callback(result)
			});
		})

		return result
	}

	function updateArticle(id, article, callback) {
		// var _sql = 'UPDATE article SET name=?, content=?, mdate=? where id=? '
		var _sql = 'UPDATE article SET state=1, '
		var post = []
		
		if(article && typeof article === "object") {
			for(var key in article) {
				_sql = _sql + ( ' ' + key + '=?, ')
				post.push(article[key])
			}
		}
		_sql += ' state=1 where id=?'
		post.push(id)
		var result = -1

		pool.getConnection(function(err, connection) {
			connection.query(_sql, post, function (error, results, fields) {
				if (error) throw error
			 	console.log('changed ' + results.changedRows + ' rows')
				 if(results){
				 	result = results.changedRows
				 }
				 callback(result)
			})
		})

		return result
	}

	function deleteArticle(id, article, callback) {
		var _sql = 'DELETE FROM article WHERE id = ?'
		var post = [id]
		var result = -1

		pool.getConnection(function(err, connection) {
			connection.query(_sql, post,  function (error, results, fields) {
				if (error) throw error

				console.log('deleted ' + results.affectedRows + ' rows')
				if(results){
					result = results.affectedRows
				}
				callback(result)
			})
		})

		return result
	}


	this.list = getArticles
	this.retrieve = getArticleById
	this.insert = addArticle
	this.update = updateArticle
	this.delete = deleteArticle

	return this
}
exports.dao = articleDao
// addArticle(new Article(null, 'jiefang', 'jiefangsfd', tools.nowDate()))
// updateArticle(6, new Article(6, 'jiefang', 'hello.dfd.', tools.nowDate()))
// deleteArticle(7)
// getArticles()