#!/bin/bash

# Get the start time
start_time=$(date +%s)

# Source the utils script
source ./scripts/utils.sh

# Function to run a submodule workaround
run_submodule_workaround() {
    local script_name=$1
    print_message "install-vercel.sh" "Starting to run ${script_name}${NC}"
    sh ../${script_name}
}

# Function to perform bun install and link
bun_install_and_link() {
    local folder=$1
    local links=$2
    local should_run_bun_link=$3

    cd ${folder}
    print_message "install-vercel.sh" "bun install for ${folder}"
    bun install

    if [ "${should_run_bun_link}" = "true" ]; then
        print_message "install-vercel.sh" "Running bun link for ${folder}"
        bun link
    fi

    for link in ${links[@]}
    do
        print_message "install-vercel.sh" "bun link for ${folder} -> ${link}"
        bun link ${link}
    done

    cd - &> /dev/null
}

# Install vercel workarounds
run_submodule_workaround "common-submodule-workaround.sh"

# Install root modules
cd ..
bun_install_and_link "." "" ""

# Install Drift SDK
bun_install_and_link "drift-common/protocol" "" ""
bun_install_and_link "drift-common/protocol/sdk" "" "true"

# Install common-ts, icons, react
bun_install_and_link "drift-common/common-ts" "@drift-labs/sdk" "true"
bun_install_and_link "drift-common/icons" "" "true"
bun_install_and_link "drift-common/react" "@drift-labs/sdk @drift/common @drift-labs/icons" "true"

# Install ui
bun_install_and_link "superstake-ui" "@drift/common @drift-labs/sdk @drift-labs/icons @drift-labs/react" ""

# Get the end time
end_time=$(date +%s)

# Calculate and print the execution time
execution_time=$(expr $end_time - $start_time)
print_message "install-vercel.sh" "Execution time: ${execution_time} seconds"