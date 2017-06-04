import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';

const createTimer = () => {
    Meteor.call('createTimer');
};

let ms = new ReactiveVar(0);

setInterval(() => {
    ms.set(ms.get() + 1);
}, 100);

const TimerListItem = (props) => (
    <div>
        <h1 onClick={createTimer}>Create timer</h1>
        { props.timers.map((it) => {
            it.counter = ms.get();
            return (
                <div key={it._id}>
                    <h1 id={it._id}>{ it.started }</h1>
                    <h1>{ it.counter }</h1>
                </div>
            );
        }) }
    </div>
);

