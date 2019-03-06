import React, { Component, Fragment } from 'react';

// import style from "./Uploader.css";

export default class Uploader extends Component {
    handleInput = (event) => {
        console.log(event);
    }

    render() {
        return (
            <Fragment>
                <input type="file" onInput={this.handleInput} />
            </Fragment>
        );
    }
}
