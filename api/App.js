const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'));
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

            let data = [];
            result.records.forEach((record) => {
                data.push(record._fields[0].trim());
            })
            res.json(data);
    } catch (error) {
        throw error;
    }
});

app.listen(9000, () => {
    console.log('Ready');
});