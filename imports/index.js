import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router';
import { CSSTransitionGroup } from 'react-transition-group';
import { AdminTimers, Timer } from './components';
import { createContainer } from 'meteor/react-meteor-data';

class _Main extends Component {

    constructor() {
        super();
        this.state = {
            modalOpen: false,
            url: '',
            name: '',

            // user
            userModalOpen: false,
            username: ''
        };
    }

    _handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    _openModal = (e) => {
        e.preventDefault();
        this.setState({
            modalOpen: true
        }, () => {
            setTimeout(() => {
                const modal_bg = document.querySelector('.modal_bg');
                const modal = document.querySelector('.modal');
                modal_bg.classList.add('open');
                modal.classList.add('shown');
            }, 0);
        });

    }

    _hideModal = (e) => {
        e ? e.preventDefault() : null;
        const modal_bg = document.querySelector('.modal_bg');
        const modal = document.querySelector('.modal');

        modal_bg.classList.remove('open');
        modal.classList.remove('shown');

        this.setState({
            modalOpen: false,
            find: '',
            login: '',
            password: ''
        });
    }

    _handleLogin = (e) => {
        e.preventDefault();
        const { login, password } = this.state;
        Meteor.loginWithPassword(login, password, () => {
            this.setState({
                adminPanelLoading: true
            });
        });
        setTimeout(() => {
            this.props.history.replace('/admin');
        }, 2500);
    }

    _handleFindTimer = (e) => {
        e.preventDefault();
        Meteor.call('findTimerByNameOrUrl', this.state.find, (err, res) => {
            if (err || !res) throw new Error('No timer found..');

            if (res === 'url') {
                this.url = this.state.find;
            } else {
                this.url = res.url;
            }

            this.setState({
                userModalOpen: true
            }, () => {
                setTimeout(() => {
                    const modal_bg = document.querySelector('.modal_bg');
                    const modal = document.querySelector('.userModal');
                    modal_bg.classList.add('open');
                    modal.classList.add('shown');
                }, 0);
            });
        });
    }

    _handleNameSubmit = (e) => {
        e.preventDefault();
        this.props.history.push({
            pathname: `/${this.url}`,
            state: { username: this.state.username }
        });
    }

    render() {
        return (
            !this.state.adminPanelLoading ?
                <div className='mainPage'>
                    <a href='' style={{width: '120px', position: 'absolute', top: '30px', right: '60px'}}
                      onClick={this._openModal}>Login</a>
                    <h1 className='mainTitle'>Timers app</h1>

                    <div className='input-group'>
                        <label htmlFor='find'  style={{color: 'white', fontSize: '22px'}}>Find a timer</label>
                        <input id='find' name='find' type='text'
                          style={{color: 'white', fontSize: '22px'}}
                          value={this.state.find}
                          onChange={this._handleInput} />
                        <a className='create-btn' onClick={this._handleFindTimer} href=''>Find</a>
                    </div>

                    <div className='modal_bg' onClick={this._hideModal} />
                    {
                    this.state.modalOpen ?
                        <div className='modal'>
                            <div className='input-group'>
                                <label htmlFor='login'>login: </label>
                                <input id='login' name='login' type='text'
                                  value={this.state.login}
                                  onChange={this._handleInput} />
                            </div>
                            <div className='input-group'>
                                <label htmlFor='password'>password: </label>
                                <input id='password' name='password' type='password'
                                  value={this.state.password}
                                  onChange={this._handleInput} />
                                <a className='create-btn' onClick={this._handleLogin} href=''>Login</a>
                            </div>
                        </div> :
                        null
                }
                    {
                    this.state.userModalOpen ?
                        <div className='modal userModal'>
                            <div className='input-group'>
                                <label htmlFor='username'>enter your name: </label>
                                <input id='username' name='username' type='text'
                                  value={this.state.username}
                                  onChange={this._handleInput} />
                                <a className='create-btn' style={{width: '150px'}} onClick={this._handleNameSubmit} href=''>Open timer</a>
                            </div>
                        </div> :
                        null
                }
                </div> :
            null
        );
    }
}

const Main = withRouter(_Main);

export default class extends Component {
    constructor() {
        super();
        this.state = {
            loggedIn: Roles.userIsInRole(Meteor.userId(), 'admin')
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                loggedIn: Roles.userIsInRole(Meteor.userId(), 'admin')
            });
        }, 500);
    }

    render() {
        return (
            <Router>
                <Route render={({ location }) => (
                    <CSSTransitionGroup
                      transitionName='fade'
                      transitionAppear
                      transitionAppearTimeout={0}
                      transitionEnter
                      transitionEnterTimeout={0}
                      transitionLeave={false}>
                        <Switch key={location.pathname}>
                            <Route location={location} key={location.key} exact path='/' render={() => {
                                if (Meteor.userId() && Roles.userIsInRole(Meteor.userId(), 'admin')) {
                                    return <Redirect to='/admin' />;
                                } else {
                                    return <Main />;
                                }
                            }} />
                            <Route location={location} key={location.key} path='/admin' render={() => {
                                if (Meteor.userId() && Roles.userIsInRole(Meteor.userId(), 'admin')) {
                                    return <AdminTimers />;
                                } else {
                                    return <Redirect to='/' />;
                                }
                            }} />
                            <Route location={location} key={location.key} path='/:url' component={Timer} />
                        </Switch>
                    </CSSTransitionGroup>
            )} />
            </Router>
        );
    }
}