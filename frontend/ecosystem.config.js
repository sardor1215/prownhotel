module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/nextjs-error.log',
    out_file: 'logs/nextjs-out.log',
    merge_logs: true,
    time: true,
    watch: false,
    ignore_watch: ['node_modules', '.next', 'public']
  }]
};
