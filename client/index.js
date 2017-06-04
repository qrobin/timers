import React from 'react';
import { render } from 'react-dom';
import Root from '/imports';

import '/imports/styles/main.css';

Meteor.startup(() => {
    render(<Root />, document.getElementById('root'));
});