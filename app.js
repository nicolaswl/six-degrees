const express = require('express');
const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'));
const session = driver.session();
const app = express();

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
            `MATCH (start:Actor), (end:Actor)
            WHERE ID(start) = ${req.params.source} AND ID(end) = ${req.params.dest}
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
        res.json(result.records);
    } catch (error) {
        throw error;
    }
});

app.listen(3000, () => {
    console.log('Ready');
});