require("dotenv").config();

var keys = require('./keys.js');
var fs = require('fs');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var omdb = require('omdb');
var request = require('request');
var inquirer = require('inquirer');

var client = new Twitter(keys.twitter);
var spotify = new Spotify(keys.spotify);

var action = process.argv;

var title;

var takeCommand = function() {
    var commandText = '';
    for (let i = 2; i < action.length; i++) {
        commandText += action[i] + ' ';
    }
    fs.appendFile('commands.txt', commandText + '\n', function(err) {
        if (err) throw err;
        console.log('Updated command text')
    })
}


var doIt = function() {
    fs.readFile('random.txt', 'utf8', function(err, file) {
        if (!err) {
            var newAction = file.split(',');
            title = newAction[1];
            switch (newAction[0]) {

                case 'my-tweets':
                    tweeterGetter();
                    break;
                case 'spotify-this-song':
                    songerGetter();
                    break;
                case 'movie-this':
                    movieSearch();
                    break;
                case 'do-what-it-says':
                    doIt();
                    break;
                default:
                    console.log('That is not a command I know!');
            }
        }
    });
}

var movieSearch = function() {
    if (title) {
        var movieTitle = title;
    } else { movieTitle = 'Mr. Nobody' }
    request('http://www.omdbapi.com/?t=' + movieTitle + '&apikey=23001998', function(err, response, body) {
        if (!err) {
            var movObj = JSON.parse(body);
            console.log('Title: ' + movObj.Title);
            console.log('Year released: ' + movObj.Year);
            console.log('IMDB rating: ' + movObj.Ratings[0].Value);
            console.log('RT rating: ' + movObj.Ratings[1].Value);
            console.log('Country produced: ' + movObj.Country);
            console.log('Language: ' + movObj.Language);
            console.log('Plot summary: ' + movObj.Plot);
            console.log('Stars: ' + movObj.Actors);
        }
    })
}

var tweeterGetter = function() {
    client.get('statuses/user_timeline', function(error, tweets, response) {
        if (!error) {
            for (let i = 0; i < tweets.length; i++) {
                console.log((i+1)+': '+tweets[i].text);
            }
        }
    });
}

var songerGetter = function() {
    if(title){
        var songTitle = title;
    }else {var songTitle = 'Ace of Base The Sign'};
    spotify.search({ type: 'track', query: songTitle }, function(err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        }
        var song = data.tracks.items[0];
        console.log('Artist: ' + song.artists[0].name);
        console.log('Title: ' + song.name);
        console.log('Preview link: ' + song.external_urls.spotify);
        console.log('Album: ' + song.album.name);
    });
}

var whatDoYouWant = function(){
    inquirer.prompt([{
        type:'list',
        message:'What would you like to do?',
        choices:['Spotify a song','Read Luke Skywalker\'s tweets','Look up a movie','Hmm...'],
        name:'firstChoice'
    }]).then(function(choice){
        var userPick = choice.firstChoice;
        if(userPick == 'Spotify a song'||userPick == 'Look up a movie'){
            inquirer.prompt([{
                type:'input',
                message: 'Title?',
                name:'title'
            }]).then(function(userChoice){
                title = userChoice.title;
                if (userPick == 'Spotify a song'){
                    songerGetter();
                } else{
                    movieSearch();
                }
            })
        } else if (userPick == 'Read Luke Skywalker\'s tweets'){
            tweeterGetter();
        } else {doIt();}
    })
}
whatDoYouWant();