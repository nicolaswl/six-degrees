import React from 'react'

function entry() {
    if (this.state.connection) {
        return (
            <div>
                {this.state.connection.map((entry) => (
                    <p>{entry}</p>
                ))}
            </div>
        );
    } else {
        return (<h1>Welcome to my Site</h1>);
    }
}

export default entry
