import React, { useEffect, useState } from 'react'
import { Card, Button, Row, Col } from 'react-bootstrap';

const Entry = (props) => {

    const [id, setId] = useState();
    const [img, setImg] = useState();


    useEffect(() => {
        async function fetchInfo() {
            let res = null;
            let data = null;

            if (props.label == "Actor") {
                res = await fetch(`http://localhost:9000/a/${props.name}`);
                data = await res.json();
            } else {
                res = await fetch(`http://localhost:9000/m/${props.name}`);
                data = await res.json();
            }

            setId(data.id)
            setImg(data.img);
        }
        fetchInfo();
    }, []);

    return (
        <Col>
            <Card>
                <Card.Img variant="bottom" src={img} />
                <Card.Body>
                    <Card.Title>{props.name}</Card.Title>
                    <Button variant="link" href={id}>Visit on IMDB</Button>
                </Card.Body>
            </Card>
        </Col>
    );
}

export default Entry
