const cron = require('node-cron');
const User = require('../models/Users');

cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();

        const result = await User.updateMany(
            {lockUntil: {$lte: now}},
            {$set: {lockUntil: null, failedLoginAttempts: 0}}
        );

        if (result.modifiedCount > 0) {
            console.log(`[Auto-Unlock]: ${result.modifiedCount} accounts unlocked.`);
        } 
    } catch(error) {
            console.error('Auto-Unlock Error:', error);
    }
})