
SyncedCron.add({
  name: 'Update DAB text with current show',

  schedule: function(parser) {
    return parser.cron('30 0 7-23 * * *', true); // thirty seconds past every hour
  },
  job: function() {
    var setDefaultText = resetDabText();
    return setDefaultText;
  }
});

SyncedCron.add({
  name: "Check if text has to be reset",

  schedule: function(parser) {
    return parser.text("every 1 minute");
  },
  job: function() {
    var checkReset = checkResetDabText();
    return checkReset;
  }
});

SyncedCron.start();
