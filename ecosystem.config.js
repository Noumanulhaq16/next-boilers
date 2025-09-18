
module.exports = {
    apps: [
        {
            name: 'iam-medic-api',
            script: './dist/main.js',
            watch: false,
            // cwd:"",
            args: '',
            interpreter_args: '',
            // instances:-1,
            env: {
                NODE_ENV: 'development',
                WITH_SCHEDULE: '1'
            },
        },
    ],
};
