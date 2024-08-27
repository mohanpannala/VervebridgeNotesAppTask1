import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { PiEyesFill } from "react-icons/pi";
import axios from 'axios';
import './index.css';

class Login extends Component {
    state = {
        showPassword: false,
        username: '',
        password: '',
        error: ''
    };

    togglePasswordShow = () => {
        this.setState({ showPassword: !this.state.showPassword });
    };

    handleLogin = async (e) => {
        e.preventDefault();
        const { username, password } = this.state;

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { username, password });
            localStorage.setItem('token', response.data.token);
            this.props.history.push('/home');
        } catch (err) {
            this.setState({ error: 'Invalid credentials' });
        }
    };

    render() {
        const { showPassword, username, password, error } = this.state;

        return (
            <div className="main-container">
                <form className="login-container" onSubmit={this.handleLogin}>
                    <h1 className="login-head">Login</h1>
                    {error && <p className="error-message">{error}</p>}
                    <label className="username">Username</label>
                    <input
                        type="text"
                        className="input-element"
                        value={username}
                        onChange={(e) => this.setState({ username: e.target.value })}
                    />
                    <label className="username">Password</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="password-input-element"
                            value={password}
                            onChange={(e) => this.setState({ password: e.target.value })}
                        />
                        <span className="password-span" onClick={this.togglePasswordShow}>
                            {showPassword ? <PiEyesFill className="icon" /> : "🙈"}
                        </span>
                    </div>
                    <button className="login-button" type="submit">Login</button>
                    <p className="login-para">If you don't have an account, <a href="/registration">Register</a></p>
                </form>
            </div>
        );
    }
}

export default withRouter(Login);
