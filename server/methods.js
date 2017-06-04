import { Meteor } from 'meteor/meteor';
import Papa from 'babyparse';
import moment from 'moment';

current_id = new Meteor.EnvironmentVariable;
const intervals = {};

// Default admin user
const admin = {
    email: 'a@a.com',
    password: '123321'
};

Meteor.startup(() => {
    Timers.find().map((timer) => {
        Meteor.call('startTimer', timer._id, true);
    });

    if (Meteor.users.find().count() === 0) {
        Accounts.createUser({...admin});

        const { _id } = Meteor.users.findOne();
        Roles.addUsersToRoles(_id, 'admin');
    }
});

Meteor.methods({
    createTimer({ name, url }) {
        return Timers.insert({
            running: false,
            passed: 0,
            stops: [],
            name,
            url
        });
    },

    resetTimer(_id) {
        clearInterval(intervals[_id]);
        return Timers.update({ _id }, {
            $set: { passed: 0, running: false }
        });
    },

    startTimer(_id, startup) {
        const it = Timers.findOne({ _id });
        if (!it.running || startup){
            current_id.withValue(_id, () => {
                const bound = Meteor.bindEnvironment(() => {
                    Timers.update({ _id }, {
                        $inc: { passed: 500 },
                        $set: { running: true, stopped: false }
                    });
                }, (e) => { throw e; });
                intervals[_id] = setInterval(bound, 500);
            });
        }
        return false;
    },

    pauseTimer(_id) {
        clearInterval(intervals[_id]);
        return Timers.update({ _id }, {
            $set: { running: false }
        });
    },

    stopTimer(_id) {
        clearInterval(intervals[_id]);
        return Timers.update({ _id }, {
            $set: { running: false, stopped: true }
        });
    },

    removeTimer(_id) {
        return Timers.remove({ _id });
    },

    addStop(_id, name) {
        currentTime = Timers.findOne({ _id }).passed;
        return Timers.update({ _id }, { $push: { stops: { name, 'value': currentTime } } });
    },

    findTimerByNameOrUrl(value) {
        if (Timers.findOne({ name: value })) return Timers.findOne({name: value});
        if (Timers.findOne({ url: value })) return 'url';
        return false;
    },

    removeStop(_id, index) {
        let stops = Timers.findOne({ _id }).stops.slice(0).reverse();
        stops.splice(index, 1);
        stops = stops.slice(0).reverse();
        Timers.update({ _id }, {
            $set: { stops: stops }
        });
    },

    exportCSV(_id) {
        const raw = Timers.findOne({ _id }).stops;

        const data = [];

        raw.map((it) => {
            data.push({
                User: it.name,
                Split: moment.utc(it.value).format('HH:mm:ss.S')
            });
        });

        const csv = Papa.unparse({
            fields: ['User', 'Split'],
            data
        });
        return csv;
    }
});