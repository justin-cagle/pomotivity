#!/bin/sh

# Default values if environment variables are not provided
ADMIN_USER=${ADMIN_USER:-admin}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-password}
SIGNUPS_ENABLED=${SIGNUPS_ENABLED:-true}

# Generate the config.js file for the frontend
cat <<EOF > /usr/share/nginx/html/config.js
window.POMOTIVITY_CONFIG = {
  ADMIN_USER: "${ADMIN_USER}",
  ADMIN_PASSWORD: "${ADMIN_PASSWORD}",
  SIGNUPS_ENABLED: ${SIGNUPS_ENABLED}
};
EOF

echo "Generated config.js with ADMIN_USER=${ADMIN_USER}"

# Execute the original command (nginx)
exec "$@"
