require('dotenv').config({ path: '../.env' });
const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
const fetch = require('node-fetch');

const driver = neo4j.driver(process.env.GRAPH_DB_HOST, neo4j.auth.basic(process.env.GRAPH_DB_USER, process.env.GRAPH_DB_PASS));
const session = driver.session();
const app = express();

app.use(cors());
app.use((req, res, next) => {
    console.log('new request made:');
    console.log('host: ', req.hostname);
    console.log('path: ', req.path);
    console.log('method: ', req.method);
    next(); // continue to next middleware 
});

app.get('/link/:source/:dest', async (req, res) => {
    try {
        const result = await session.run(
            `MATCH (start:Actor {name: \"${req.params.source}\"}), (end:Actor {name: \"${req.params.dest}\"})
            CALL gds.alpha.shortestPath.stream({
                nodeProjection: ['Actor', 'Movie'], 
                relationshipProjection: {
                    in: { 
                            type: 'in', 
                            orientation: 'UNDIRECTED'}
                    }, 
                    startNode: start, 
                    endNode: end
            }) 
            YIELD nodeId 
            RETURN gds.util.asNode(nodeId).name`, {});
        console.log(result.records);
        let data = [];
        result.records.forEach((record) => {
            data.push(record._fields[0].trim());
        })
        res.json(data);
    } catch (error) {
        throw error;
    }
});

app.get('/a/:actor', async (req, res) => {
    const uri = `https://imdb-api.com/en/API/SearchName/${process.env.IMDB_KEY}/${req.params.actor}`;
    const response = await fetch(uri);
    const data = await response.json();

    let img = null;
    let id = null;
    if(data.results) {
        img = data.results[0].image;
        id = `https://www.imdb.com/name/${data.results[0].id}/`;
    }

    res.json({id, img});
});

app.get('/m/:movie', async (req, res) => {
    const uri = `https://imdb-api.com/en/API/SearchMovie/${process.env.IMDB_KEY}/${req.params.movie}`;
    const response = await fetch(uri);
    const data = await response.json();

    let img = null;
    let id = null;
    if(data.results) {
        img = data.results[0].image;
        id = `https://www.imdb.com/title/${data.results[0].id}/`;
    }

    res.json({id, img});
});

app.listen(9000, () => {
    console.log(`Ready on ${process.env.API_HOST}`);
});