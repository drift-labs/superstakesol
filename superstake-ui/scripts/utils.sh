# utils.sh

# Define color codes
RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
BLUE="\e[34m"
NC="\e[0m"

# Escaped Colors
BLUE_ESCAPED='\033[0;34m'
NC_ESCAPED='\033[0m'

# Function to print colored messages
print_message() {
    local script_name=$1
    local message=$2
    echo -e "${BLUE}#task - (${script_name}): ${message}${NC}"
}

# Function to print colored messages
print_message_local() {
    local script_name=$1
    local message=$2
    echo "${BLUE_ESCAPED}#task - (${script_name}): ${message}${NC_ESCAPED}"
}