const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017/six-degrees';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
let nodes = null;

client.connect().then(async () => {
    nodes = client.db('six-degrees').collection('nodes');
    let res = await BFS('Kevin Bacon', 'Harrison Ford');
    console.log(res);
    client.close();
});

async function resetdb() {
    await nodes.updateMany({ type: 'actor' }, {
        $set: {
            visited: false,
            previous: null
        }
    });
    await nodes.updateMany({ type: 'movie' }, {
        $set: {
            previous: null
        }
    });
}

async function BFS(source, target) {
    await resetdb();
    let queue = [];
    let response = [];

    // find root and set it to visited
    let root = await nodes.findOne({ type: 'actor', name: source });
    await nodes.updateOne({ _id: root._id }, {
        $set: {
            visited: true
        }
    });
    queue.push(await nodes.findOne({_id: root._id}));

    while (queue.length != 0) {
        let node = queue.shift();

        if (node.name == target) {
            let actor = node;
            

            while (actor.name != source) {
                response.unshift(actor.name);
                let movie = await nodes.findOne({ _id: actor.previous });
                response.unshift(movie.name);
                actor = await nodes.findOne({ _id: movie.previous });
            }
            return response;
        }

        for await (const movieId of node.movies){
            let movie = await nodes.findOne({ _id: movieId });
            for await (const actorId of movie.actors){
                let actor = await nodes.findOne({ _id: actorId });
                if (!actor.visited) {
                    await nodes.updateOne({ _id: actorId }, {
                        $set: {
                            visited: true,
                            previous: movieId
                        }
                    });
                    await nodes.updateOne({ _id: movieId }, {
                        $set: {
                            previous: node._id
                        }
                    });
                    queue.push(await nodes.findOne({ _id: actorId }));
                }
            }
        }
    }
    return response;
}