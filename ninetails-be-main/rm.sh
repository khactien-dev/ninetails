# Specify the volumes you want to keep
KEEP_VOLUME1="ninetails-be_opensearch"
KEEP_VOLUME2="ninetails-be_postgres-data"

# List all Docker volumes, filter out the ones to keep, and remove the rest
docker volume ls -q | grep -v -e "$KEEP_VOLUME1" -e "$KEEP_VOLUME2" | xargs -r docker volume rm
