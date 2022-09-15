import React from 'react'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.js'

const ROOT = createRoot(document.getElementById('app'));
ROOT.render(
    <React.Fragment>
        <App></App>
    </React.Fragment>
)
