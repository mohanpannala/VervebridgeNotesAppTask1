import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';

function App() {
    return (
        <Router>
            <Switch>
            {/* when the respective path triggers the respective component renders into the UI */}
                <Route exact path="/" component={Login} /> 
                <Route exact path="/home" component={Home} />
                <Route exact path="/registration" component={Registration} />
            </Switch>
        </Router>
    );
}

export default App;
