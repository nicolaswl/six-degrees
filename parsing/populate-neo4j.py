from neo4j import GraphDatabase
import re 

driver = GraphDatabase.driver('neo4j://localhost:7687', auth=("neo4j", "password"))
with driver.session() as session:
    file = open('./imdb_2019.tsv')
    for line in file:
        split = line.split('\t')
        actor = split[0]
        movie = split[1] + ' ' + split[2]

        if '\"' in movie:
            res = []
            for match in re.finditer("[\"]", movie):
                res.append(match.start())
            for i in range(0, len(res)):
                movie = movie[:res[i] + i] + '\\' + movie[res[i] + i:] 


        print('creating ' + actor + ' in ' + movie)
    
        query = 'MERGE (a:Actor {{name: \"{0}\"}}) MERGE (m:Movie {{title: \"{1}\"}}) CREATE (a)-[:in]->(m)'
        session.run(query.format(actor, movie)) 

driver.close()