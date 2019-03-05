import React, { Component, Fragment } from "react";

import style from "./AppTitle.css";

import Uploader from './Uploader'

export default class AppTitle extends Component {
    render () {
        return (
            <Fragment>
                <h1>WadJS</h1>
                <div>version {VERSION}</div>
            </Fragment>
        );
    }
}
