const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const isAccountLocked = (user) => {
    return user.lockUntil && user.lockUntil > Date.now();
}

module.exports = {
    MAX_FAILED_ATTEMPTS,
    LOCK_TIME,
    isAccountLocked
};