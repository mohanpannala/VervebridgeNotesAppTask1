import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { PiEyesFill } from "react-icons/pi";
import axios from 'axios';
import './index.css';

class Registration extends Component {
    state = {
        showPassword: false, //to tract the password show status to show
        confirmPasswordVisible: false, // tp tract the conform password status to show
        username: '', // initializing username with empty value
        password: '', // initializing password with empty value
        confirmPassword: '', // initializing confirm password with empty value
        error: '' // initializing error with empty value to track the error
    };

    togglePasswordShow = () => {
        //method to toggle the password to show or not
        this.setState({ showPassword: !this.state.showPassword });
    };

    toggleConfirmPasswordShow = () => {
        // method to toggle the conform password to show or not
        this.setState({ confirmPasswordVisible: !this.state.confirmPasswordVisible });
    };

    handleRegistration = async (e) => {
        //method to handle the Registration 
        e.preventDefault();
        const { username, password, confirmPassword } = this.state;

        if (password !== confirmPassword) {
            this.setState({ error: "Passwords do not match" });
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/users/register', { username, password });
            this.props.history.push('/'); // with this after successful registration the user will be directed to the login page
        } catch (err) {
            this.setState({ error: err.response?.data?.error || "Registration failed" }); // if any error occur it updates error with the given string
        }
    };

    render() {
        const { showPassword, confirmPasswordVisible, username, password, confirmPassword, error } = this.state;

        return (
            <div className="main-container">
            {/* the below form is the UI of registration form  */}
                <form className="login-container" onSubmit={this.handleRegistration}>
                    <h1 className="login-head">Registration</h1>
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
                    <label className="username">Confirm Password</label>
                    <div className="password-container">
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            id="confirmPassword"
                            className="password-input-element"
                            value={confirmPassword}
                            onChange={(e) => this.setState({ confirmPassword: e.target.value })}
                        />
                        <span className="password-span" onClick={this.toggleConfirmPasswordShow}>
                            {confirmPasswordVisible ? <PiEyesFill className="icon" /> : "🙈"}
                        </span>
                    </div>
                    <button className="login-button" type="submit">Register</button>
                </form>
            </div>
        );
    }
}

export default withRouter(Registration);
