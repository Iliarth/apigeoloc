var express = require('express')
var http = require('http')
var request = require('request')
var app = express()
var redis = require('redis')
var redisClient = redis.createClient({host:'redis'})

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	next();
});

app.get('/getpais', (req, res) => {
	var lat = req.query.lat
	var lgt = req.query.lgt
	var key = 'AIzaSyA3BZlyFda4GGro9wg_eNTJkN6u8D_7JXM'
	var letlng = String(lat) + ',' + String(lgt)

	const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + letlng + '&key=' + key
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			var obj = JSON.parse(body)

			for (var key in obj.results) {
				if (obj.results[key].types[0] == 'administrative_area_level_1') {

					for (var key2 in obj.results[key].address_components) {
						if (obj.results[key].address_components[key2].types[0] == 'country') {
							res.set('Content-Type', 'application/json')
							res.status(200).send(obj.results[key].address_components[key2])
						}
					}
				}

			}

		} else {
			res.status(200).send(error)
			//return error
		}
	})
})

app.get('/getcapital', (req, res) => {
	var pais = req.query.pais

	const url = 'http://api.worldbank.org/v2/country/' + pais + '?format=json'
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {

			var obj = JSON.parse(body)
			res.set('Content-Type', 'application/json')
			res.status(200).send(obj[1])

		} else {
			res.status(200).send(error)
			//return error
		}
	})
})

app.get('/gettemperatura', (req, res) => {
	var lat = req.query.lat
	var lgt = req.query.lgt
	var key = req.query.key
	var redisKey = String(lat) + String(lgt)

	var resultado = ''


	redisClient.exists(redisKey, function (err, reply) {
		if (err != null) {

		}
		else {
			redisClient.get(redisKey, function (err, value) {
				if (value != null) {
					res.set('Content-Type', 'application/json')
					res.status(200).send({ temperatura: value, origen: "redis" })
				} else {
					const url = 'https://api.darksky.net/forecast/' + key + '/' + lat + ',' + lgt;

					resultado = request(url, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							var obj = JSON.parse(body)
							var temp = (parseFloat(obj.currently.temperature) - 32) * 5 / 9
							redisClient.set(redisKey, temp);
							res.set('Content-Type', 'application/json')
							res.status(200).send({ temperatura: temp, origen: "API" })

						} else {
							res.status(response.statusCode).send(error)
						}
					})
				}

			});



		}
	});




	//res.status(200).send(resultado)
})

http.createServer(app).listen(8000, () => {
	console.log('Server started at http://localhost:8000');
	redisClient.on('connect', function () {
		console.log('Conectado a Redis Server');
	});


});