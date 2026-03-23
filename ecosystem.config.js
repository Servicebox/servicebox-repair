// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'servicebox-repair',
        script: 'src/server.js',
        instances: 1,
        exec_mode: 'fork',

        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },

        // Производительность
        max_memory_restart: '1G',
        kill_timeout: 5000,
        listen_timeout: 10000,
        shutdown_with_message: true,
        wait_ready: true,

        // Логи
        error_file: '/var/log/servicebox/error.log',
        out_file: '/var/log/servicebox/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Автоматический рестарт
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',

        // Мониторинг
        watch: false,
        ignore_watch: ['node_modules', '.next', 'logs', 'public/uploads'],

        // Переменные окружения
        env_file: '.env.production'
    }]
};