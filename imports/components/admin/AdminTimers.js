import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { CSSTransitionGroup } from 'react-transition-group';
import moment from 'moment';
import { Roles } from 'meteor/alanning:roles';
import { withRouter } from 'react-router';

import Collapse from 'rc-collapse';
var Panel = Collapse.Panel;
require('rc-collapse/assets/index.css');

class _Timer extends Component {
    constructor(props) {
        super(props);
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

    _removeTimer = (e) => {
        e.preventDefault();
        const { it } = this.props;
        Meteor.call('removeTimer', it._id);
    }

    _addStop = (e) => {
        e.preventDefault();
        const { it } = this.props;
        if (it.running) {
            Meteor.call('addStop', it._id, 'Admin');
        } else {
            alert('Timer is not currently available to make notes. Start it to keep splitting.');
        }
    }

    _goTimer = (url) => {
        console.log(url);
        this.props.history.push(`/${url}`);
    }

    render() {
        const { it } = this.props;
        return (
            <div className='timers-list'>
                <CSSTransitionGroup
                  transitionName='fade_rel'
                  transitionAppear
                  transitionAppearTimeout={0}
                  transitionEnter
                  transitionEnterTimeout={0}
                  transitionLeave
                  transitionLeaveTimeout={0}>

                    <div className='adminListItem'>

                        {
                        it.stopped ?
                            <div className='icon'>
                                <i className='fa fa-check' aria-hidden='true' />
                            </div>
                        :
                            <a className='icon' onClick={this._stopTimer} href=''>
                                <i className='fa fa-stop-circle-o' aria-hidden='true' />
                            </a>
                        }

                        <h1 className='time'>{ moment.utc(it.passed).format('HH:mm:ss.S') }</h1>
                        <h1 className='name' onClick={() => this._goTimer(it.url)}>{ it.name }</h1>
                        <a className='icon' href='' onClick={(e) => {
                            e.preventDefault();
                            prompt('', window.location.origin + '/' + it.url, '');
                        }}>
                            <i className='fa fa-link' aria-hidden='true' />
                        </a>
                        <a className='icon' href='' onClick={this._addStop}>
                            <i className='fa fa-pencil-square-o' aria-hidden='true' />
                        </a>

                        {
                        it.running ?
                            <a className='icon' onClick={this._pauseTimer} href=''>
                                <i className='fa fa-pause' aria-hidden='true' />
                            </a>
                        :
                            <a className='icon' onClick={this._startTimer} href=''>
                                <i className='fa fa-play-circle-o' aria-hidden='true' />
                            </a>
                        }

                        <a className='icon' onClick={this._removeTimer} href=''>
                            <i className='fa fa-times' aria-hidden='true' />
                        </a>
                        <a className='icon' onClick={this._resetTimer} href=''>
                            <i className='fa fa-repeat' aria-hidden='true' />
                        </a>
                    </div>
                    {it.stops.length ?
                        <Collapse accordion className='stops'>
                            <Panel header='Splits' headerClass='acc-header'>
                                {it.stops.slice(0).reverse().map((item, index) => (
                                    <div key={index} className='stop-item'>
                                        <h1>{item.name}</h1>
                                        <h1>{moment.utc(item.value).format('HH:mm:ss.S')}</h1>
                                    </div>
                                ))}
                            </Panel>
                        </Collapse> : null
                    }
                </CSSTransitionGroup>
                <hr />
            </div>
        );
    }
}

const Timer = withRouter(_Timer);

const ripple = (e) => {
    const t = e.currentTarget;
    t.classList.add('ripple');
    t.classList.remove('ripple');
};

class AdminTimers extends Component {
    constructor() {
        super();
        this.state = {
            modalOpen: false,
            url: '',
            name: ''
        };
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
            name: '',
            url: ''
        });
    }

    _handleCreateTimer = (e) => {
        e ? e.preventDefault() : null;
        this._hideModal();
        Meteor.call('createTimer', {...this.state});
    }

    _handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    render() {
        return (
            <div className='admin-panel'>
                <h1 className='admin-panel-header'>Admin panel</h1>
                <h1 onClick={this._openModal} className='create-btn'>Create timer</h1>
                {
                    this.props.loading ?
                    null :
                    <div className='adminList'>
                        { this.props.timers.map(it => <Timer key={it._id} it={it} />) }
                    </div>
                }
                <div className='modal_bg' onClick={this._hideModal} />
                {
                    this.state.modalOpen ?
                        <div className='modal'>
                            <div className='input-group'>
                                <label htmlFor='name'>Name: </label>
                                <input id='name' name='name' type='text'
                                  value={this.state.name}
                                  onChange={this._handleInput} />
                            </div>
                            <div className='input-group'>
                                <label htmlFor='timer'>teamwatch.com/</label>
                                <input id='timer' name='timer' type='text'
                                  value={this.state.url}
                                  onChange={this._handleInput}
                                  onFocus={() => {
                                      this.setState({
                                          url: this.state.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9/-]/g, '')
                                      });
                                  }} />
                                <a className='create-btn' onClick={this._handleCreateTimer} href=''>Create</a>
                            </div>
                        </div> :
                        null
                }
            </div>
        );
    }
}

export default createContainer(() => {
    const handle = Meteor.subscribe('allTimers');
    return {
        loading: !handle.ready(),
        timers: Timers.find().fetch()
    };
}, AdminTimers);