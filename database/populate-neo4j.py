from neo4j import GraphDatabase
import re 

def add_line(tx, actor, movie):
    tx.run("MERGE (a:Actor {name: $actor}) "
        "MERGE (m:Movie {name: $movie}) "
        "CREATE (a)-[:in]->(m)",
        actor=actor, movie=movie)

driver = GraphDatabase.driver('neo4j://localhost:7687', auth=("neo4j", "password"))
with driver.session() as session:
    file = open('./imdb_2019.tsv')
    count = 0.0
    for line in file:
        split = line.split('\t')
        actor = split[0]
        movie = split[1] + ' ' + split[2]

        # if '\"' in movie:
        #     res = []
        #     for match in re.finditer("[\"]", movie):
        #         res.append(match.start())
        #     for i in range(0, len(res)):
        #         movie = movie[:res[i] + i] + '\\' + movie[res[i] + i:] 

        print('creating ' + actor + ' in ' + movie + (count / len(file)))
        count = count + 1
        session.write_transaction(add_line, actor, movie)
driver.close()