class GuardUtils {
  /**
   * identifier is a random integer in the range 1000,
   * it is assigned to a specific role
   */
  get siteRoles() {
    return {
      ADMIN: 741,
      MODERATOR: 273,
      USER: 112
    };
  }

  get scopes() {
    return {
      users: [this.siteRoles.ADMIN]
    };
  }
}

module.exports = new GuardUtils();
