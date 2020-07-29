import React, { Component } from 'react';
import { Form, Row, Container, Col, Button } from 'react-bootstrap';
import Entry from './components/Entry';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connection: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const actor1 = document.getElementById('actor1').value;
    const actor2 = document.getElementById('actor2').value;
    const response = await fetch(`http://localhost:9000/link/${actor1}/${actor2}`);
    const data = await response.json();
    this.setState({ connection: data });
  }

  render() {
    const connection = this.state.connection
    if (connection) {
      return (
        <Container>
          {connection.map(entry => (
            <Entry name={entry} />
          ))}
        </Container>
      );
    } else {
      return (
        <Container>
          <Form onSubmit={this.handleSubmit}>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Actor 1</Form.Label>
                  <Form.Control id="actor1" placeholder="Kevin Bacon" required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Actor 2</Form.Label>
                  <Form.Control id="actor2" placeholder="Harrison Ford" required />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="dark" type="Submit">Go!</Button>
          </Form>
        </Container>
      );
    }
  }
}

export default App;