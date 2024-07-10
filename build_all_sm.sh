# Capture the start time
start_time=$(date +%s)

# Source the utils script
source ./superstake-ui/scripts/utils.sh

# Function to handle repetitive tasks
function handle_directory() {
  dir=$1
  build=$2
  link_packages=$3
  link=$4

  print_message_local "build_all_sm.sh" "Installing $dir"

  cd $dir && rm -rf node_modules && bun install

  for link_package in ${link_packages[@]}
  do
      print_message_local "build_all_sm.sh" "bun link for ${folder} -> ${link_package}"
      bun link ${link_package}
  done

  if [ "$build" = true ] ; then
    yarn build
  fi

  if [ "$link" = true ] ; then
    bun link
  fi

  cd - &> /dev/null
}

function get_submodules() {
  git submodule update --init
}

# Capture the start time
start_time=$(date +%s)

# Get all submodules - will skip if already present
# get_submodules # current directory submodules
# cd drift-common
# get_submodules # Drift SDK submodule
# cd ..

# Call the function with directory name, build and link flags
handle_directory "." false "" false
handle_directory "drift-common" false "" false
handle_directory "drift-common/protocol/sdk" true "" true
handle_directory "drift-common/common-ts" true "@drift-labs/sdk" true
handle_directory "drift-common/icons" true "" true
handle_directory "drift-common/react" true "@drift-labs/sdk @drift/common @drift-labs/icons" true
handle_directory "superstake-ui" true "@drift-labs/sdk @drift/common @drift-labs/icons @drift-labs/react"  false

# Capture the end time
end_time=$(date +%s)

# Calculate and print the duration
duration=$((end_time - start_time))
echo "FINISHED .. Total time taken: $duration seconds"