module.exports = {
    apps: [
        {
            name: 'servicebox-repair',
            script: 'node',
            args: '--env-file=.env.production src/server.js',
            cwd: '/var/www/servicebox-repair',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                NODE_OPTIONS: '--max-old-space-size=4096',
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                NODE_OPTIONS: '--max-old-space-size=4096',
            },
            error_file: '/var/log/servicebox-repair/error.log',
            out_file: '/var/log/servicebox-repair/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true,
            max_restarts: 10,
            restart_delay: 2000,
            exp_backoff_restart_delay: 100,
        },
    ],
};