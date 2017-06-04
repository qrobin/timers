import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { CSSTransitionGroup } from 'react-transition-group';
import { withRouter } from 'react-router';
import moment from 'moment';
import { Roles } from 'meteor/alanning:roles';

class Timer extends Component {
    constructor(props) {
        super(props);
        this.isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin');

        this.state = {
            userModalOpen: false,
            username: '',
            usernameInput: ''
        };
    }

    componentDidMount() {
        setTimeout(() => {

            if (this.props.location.state) {
                console.log('props');
                this.setState({
                    username: this.props.location.state.username
                });
            } else if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
                console.log('admin');
                this.setState({
                    username: 'Admin'
                });
            } else {
                this.setState({
                    userModalOpen: true
                }, () => {
                    setTimeout(() => {
                        const modal_bg = document.querySelector('.modal_bg');
                        const modal = document.querySelector('.userModal');
                        modal_bg.classList.add('open');
                        modal.classList.add('shown');
                    }, 500);
                });

            }
        }, 500);
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

    _handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    _handleNameSubmit = (e) => {
        e.preventDefault();
        this.setState({
            username: this.state.usernameInput
        }, () => {
            this._hideModal();
        });
    }

    _startTimer = (e) => {
        e.preventDefault();
        const { it } = this.props;
        Meteor.call('startTimer', it._id);
    }

    _pauseTimer = (e) => {
        e.preventDefault();
        const { it } = this.props;
        Meteor.call('pauseTimer', it._id);
    }

    _resetTimer = (e) => {
        e.preventDefault();
        const { it } = this.props;
        Meteor.call('resetTimer', it._id);
    }

    _stopTimer = (e) => {
        e.preventDefault();
        const { it } = this.props;
        Meteor.call('stopTimer', it._id);
    }

    _addStop = (e) => {
        e.preventDefault();
        const { it } = this.props;
        const username = this.state.username;
        Meteor.call('addStop', it._id, username);
    }

    _removeStop = (e, _id, index) => {
        e.preventDefault();
        Meteor.call('removeStop', _id, index);
    }

    _exportCSV = (e) => {
        e.preventDefault();
        const { it } = this.props;
        Meteor.call('exportCSV', it._id, (err, res) => {
            var blob = new Blob([res], {type: 'text/plain;charset=utf-8'});
            saveAs(blob, `${it.name}__${moment().format('MM/DD HH:mm:ss')}.csv`);
        });
    }

    render() {
        const { it, loading } = this.props;
        const isAdmin = Roles.userIsInRole(Meteor.userId(), 'admin');

        return (
            loading ? null :
            <div>
                { this.state.username ?
                    <CSSTransitionGroup
                      transitionName='fade_rel'
                      transitionAppear
                      transitionAppearTimeout={0}
                      transitionEnter
                      transitionEnterTimeout={0}
                      transitionLeave
                      transitionLeaveTimeout={0}>
                        <div className='timer'>
                            <div className='header'>
                                <div className='left'>
                                    <h1>{it.name}</h1>
                                    <h1>In Progress: {moment.utc(it.passed).format('HH:mm:ss.S')}</h1>
                                </div>
                                <div className='right'>
                                    <h1>{this.state.username}</h1>
                                </div>
                            </div>
                            <h1 className='title'>Team Timer</h1>
                            <h1>Pess the button to make a note of time</h1>
                            <div className='controls'>
                                {isAdmin ?
                            it.running ?
                                <a className='icon' onClick={this._pauseTimer} href=''>
                                    <i className='fa fa-pause' aria-hidden='true' />
                                </a>
                            :
                                <a className='icon' onClick={this._startTimer} href=''>
                                    <i className='fa fa-play-circle-o' aria-hidden='true' />
                                </a>
                            : null
                        }
                                <a className='create-btn note-btn' onClick={this._addStop} href=''>Note</a>
                                {isAdmin ?
                        it.stopped ?
                            <div className='icon'>
                                <i className='fa fa-check' aria-hidden='true' />
                            </div>
                            :
                            <a className='icon' onClick={this._stopTimer} href=''>
                                <i className='fa fa-stop-circle-o' aria-hidden='true' />
                            </a>
                            : null}
                                {isAdmin ?
                                    <a className='icon' onClick={this._resetTimer} href=''>
                                        <i className='fa fa-repeat' aria-hidden='true' />
                                    </a> : null}
                            </div>
                            <div className='stops-list'>
                                {it.stops.slice(0).reverse().map((item, index) => (
                                    <div key={index} className='stop-item'>
                                        <h1>{item.name}</h1>
                                        <h1>{moment.utc(item.value).format('HH:mm:ss.S')}</h1>
                                        {isAdmin ?
                                            <a className='icon' onClick={(e) => this._removeStop(e, it._id, index)} href=''>
                                                <i className='fa fa-times' aria-hidden='true' />
                                            </a> : null}
                                    </div>
                        ))}
                            </div>
                            {isAdmin ?
                                <a className='create-btn note-btn' onClick={this._exportCSV} href=''>Export</a> : null}
                        </div>
                    </CSSTransitionGroup> : null }
                <div className='modal_bg' />
                {
                    this.state.userModalOpen ?
                        <div className='modal userModal'>
                            <div className='input-group'>
                                <label htmlFor='usernameInput'>enter your name: </label>
                                <input id='usernameInput' name='usernameInput' type='text'
                                  value={this.state.usernameInput}
                                  onChange={this._handleInput} />
                                <a className='create-btn' style={{width: '150px'}} onClick={this._handleNameSubmit} href=''>Open timer</a>
                            </div>
                        </div> :
                        null
                }
            </div>
        );
    }
}


export default createContainer((props) => {
    const { url } = props.match.params;
    const handle = Meteor.subscribe('singleTimer', url);
    return {
        loading: !handle.ready(),
        it: Timers.findOne()
    };
}, withRouter(Timer));