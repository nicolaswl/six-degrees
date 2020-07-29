import React, { useEffect, useState } from 'react'
import { Card, Button, Row, Col } from 'react-bootstrap';

const Entry = (props) => {

    const [id, img] = useState();

    useEffect(async () => {
        let res = null;
        let data = null;
        if (props.type == "Actor") {
            res = await fetch(`http://localhost:9000/a/${this.props.name}`);
            data = await res.json();
        } else {
            res = await fetch(`http://localhost:9000/m/${this.props.name}`);
            data = await res.json();
        }

        id(data.id)
        img(data.img);
    }, []);

    return (
        <Row>
            <Col>
                <Card>
                    <Card.Img src={img} />
                    <Card.Body>
                        <Card.Title>{props.name}</Card.Title>
                        <Button variant="dark" ref={id}>Visit on IMDB</Button>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default Entry
