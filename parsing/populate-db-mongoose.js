const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');

const dbURI = 'mongodb+srv://admin:RLUSsl6hIOtwSkHz@cluster0.hxbyv.mongodb.net/six-degrees?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));

const Schema = mongoose.Schema
const actorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    movies: [Schema.Types.ObjectId]
});

const movieSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    actors: [Schema.Types.ObjectId]
});

const Actor = mongoose.model('Actor', actorSchema);
const Movie = mongoose.model('Movie', movieSchema);

const rl = readline.createInterface({
    input: fs.createReadStream('imdb_2019.tsv'),
    output: process.stdout,
    terminal: false
});

rl.on('line', async (line) => {
    const res = line.split('\t');

    if(res.length != 3) {
        return;
    }

    const actor = res[0];
    const movie = res[1] + ' ' + res[2];

    let a = await Actor.find({name: actor});

    // if actor doesn't exist in db
    if(a.length == 0) {
        a = await Actor.create({
            name: actor
        });
        await a.save();


        let m = await Movie.find({
            name: movie
        });

        // if neither actor nor movie exist in db
        if(m.length == 0) {
            m = await Movie.create({
                name: movie,
                actors: [a._id]
            });
            await m.save();

            a.movies.push(m._id);
            await a.save();
        } else { // if actor doesn't exist in db, but movie does
            m[0].actors.push(a._id);
            await m.save();

            a.movies.push(m[0]._id);
            await a.save();
        }
    } else { // actor exists in db 
        let m = await Movie.find({
            name: movie
        });

        // if movie doesn't exist in db, but actor does
        if(m.length == 0) { 
            m = await Movie.create({
                name: movie,
                actors: [a[0]._id]
            });
            await m.save();

            a.movies.push(m._id);
            await a.save();
        } else { // if movie and actor exist in db
            a[0].movies.push(m[0]._id);
            await a.save();

            m[0].actors.push(a[0]._id);
            await m.save();
        }
    }
    console.log('finished line');
});

