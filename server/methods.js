/* Shared server-side methods */

Meteor.methods({
  addUser: function(user) {

    check(user, Object);
    password = Random.secret(10);

    user.createdByID = this.userId;
    user.createdBy = Meteor.user().profile.name;

    // Produces better errors than Meteor.runRestricted
    Security.can(this.userId).insert(user).for(Meteor.users).throw();

    if(!!Meteor.users.findOne({username: user.username})){
      throw new Meteor.Error(400, "Username is taken");
    }

    userId = Meteor.users.insert(user);

    if(userId) {
      Accounts.setPassword(userId, password);
    }

    Mail.send({
      to: user.username,
      from: "Radioteknisk <radioteknisk@studentmediene.no>",
      subject: "You can now sign in at dab.radiorevolt.no",
      text: "An administrator has created a new account with this email at dab.radiorevolt.no.\n" +
            "You are now registrerd with the following information\n\n" +
            "Name: " + user.profile.name + "\n" +
            "Email: " + user.username + "\n" +
            "Password: " + password + "\n\n" +
            "The first time you sign in, you'll have to change the password.\n\n" +
            "If you have any questions, please reply to this email.\n\n" +
            "-- \n" +
            "Radioteknisk"
    });

  },
  setPassword: function(userId, email) {
    password = Random.secret(10);
    Meteor.runRestricted(function() {
      Accounts.setPassword(userId, password);
      Mail.send({
        to: email,
        from: "Radioteknisk <radioteknisk@studentmediene.no>",
        subject: "New password at dab.radiorevolt.no",
        text: "An administrator has reset your password.\n" +
              "Your new password is: " + password
      });
    });
  },
  addToRole: function(userId, role) {
    check(role, String);
    check(userId, String);

    modifier = {
      $push: {roles: role}
    }

    Security.can(this.userId).update(userId, modifier).for(Meteor.users).throw();

    Roles.addUsersToRoles(userId, role);
  },
  removeFromRole: function(userId, role) {
    check(role, String);
    check(userId, String);

    modifier = {
      $pull: {roles: role}
    }

    Security.can(this.userId).update(userId, modifier).for(Meteor.users).throw();

    Roles.removeUsersFromRoles(userId, role);
  },
  addText: function(text) {

    check(text, Object);

    text.createdByID = this.userId;
    text.createdBy = Meteor.user().profile.name;

    Security.can(this.userId).insert(text).for(DABText).throw();

    DABText.insert(text);
  },
  resetText: function() {
    text = {
      // Temporary default text
      text: "Radio Revolt, studentradioen i Trondheim",
      createdBy: "GLaDOS",
      createdByID: Random.id()
    }

    Security.can(this.userId).insert(text).for(DABText).throw();

    DABText.insert(text);
  },
  checkPassword: function (digest) {
    // This is kind of a hack, and might brake in the future.
    if(this.userId) {
      var user = Meteor.user();
      var password = {digest: digest, algorithm: 'sha-256'};
      var result = Accounts._checkPassword(user, password);
      return result.error == null;
    } else {
      return false;
    }
  }
});
