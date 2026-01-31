module.exports = {
    apps: [
        {
            name: 'growlog-api',
            cwd: './apps/api',
            script: 'npm',
            args: 'run dev',
            watch: false,
            env: {
                NODE_ENV: 'development',
                PORT: 15100
            }
        },
        {
            name: 'growlog-web',
            cwd: './apps/web',
            script: 'npm',
            args: 'run dev',
            watch: false,
            env: {
                NODE_ENV: 'development'
            }
        },
        {
            name: 'growlog-db',
            script: 'docker',
            args: 'compose up',
            autorestart: false,
            watch: false
        }
    ]
};
