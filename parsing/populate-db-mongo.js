const { MongoClient } = require('mongodb');
const fs = require('fs');
const readline = require('readline');

const url = 'mongodb://localhost:27017/six-degrees';
const client = new MongoClient(url);
let collection = null;

client.connect().then(async () => {
    collection = client.db('six-degrees').collection('nodes');
    collection.createIndex({ name: 1 });
    await processLineByLine();
    client.close();
    console.log('done');
});

async function processLineByLine() {
    const fileStream = fs.createReadStream('./imdb_2019.tsv');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const split = line.split('\t');
        const actorName = split[0];
        const movieName = split[1] + ' ' + split[2];
        await updatedb(actorName, movieName);
        console.log('line finished ' + new Date());
    }
}

async function updatedb(actorName, movieName) {
    let actor = await collection.findOne({ type: 'actor', name: actorName });
    if (actor) { // actor exists in db
        let movie = await collection.findOne({ type: 'movie', name: movieName });

        if (movie) { // movie exists in db
            await collection.updateOne({ _id: actor._id }, {
                $push: {
                    movies: movie._id
                }
            });
            await collection.updateOne({ _id: movie._id }, {
                $push: {
                    actors: actor._id
                }
            });
        } else { // movie doesn't exist in db
            movie = await collection.insertOne({
                type: 'movie',
                name: movieName,
                actors: [actor._id]
            });
            await collection.updateOne({ _id: actor._id }, {
                $push: {
                    movies: movie.insertedId
                }
            });
        }
    } else { // actor doesn't exist in db
        let movie = await collection.findOne({ type: 'movie', name: movieName });

        if (movie) { // movie exists in db
            actor = await collection.insertOne({
                type: 'actor',
                name: actorName,
                movies: [movie._id]
            });
            await collection.updateOne({ _id: movie._id }, {
                $push: {
                    actors: actor.insertedId
                }
            });
        } else { // movie doesn't exist in db 
            actor = await collection.insertOne({
                type: 'actor',
                name: actorName,
            });
            movie = await collection.insertOne({
                type: 'movie',
                name: movieName,
            });
            await collection.updateOne({ _id: movie.insertedId }, {
                $push: {
                    actors: actor.insertedId
                }
            });
            await collection.updateOne({ _id: actor.insertedId }, {
                $push: {
                    movies: movie.insertedId
                }
            });
        }
    }
}
