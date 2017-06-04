Meteor.publish('allTimers', function() {
    return Timers.find();
});
Meteor.publish('singleTimer', function(url) {
    return Timers.find({ url });
});

Meteor.publish('ttt', function() {
    return r_timer.get();
});