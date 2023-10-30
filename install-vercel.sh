cd ..
echo "$PWD"
pwd
yarn install
echo "changing directory to drift-common"
cd ./drift-common/protocol 
echo "pwd"
pwd
rm -rf cli
echo "yarn install for protocol"
yarn install --ignore-scripts
echo "cd ./sdk"
cd ./sdk 
echo "yarn install for protocol/sdk"
yarn install
echo "yarn link for protocol/sdk"
yarn link
echo "cd ../../common-ts"
cd ../../common-ts
echo "yarn install for common-ts"
yarn install
echo "yarn link for common-ts"
yarn link @drift-labs/sdk
yarn link
echo "cd ../icons"
cd ../icons
echo "yarn install for icons"
yarn install
yarn link
echo "cd ../react"
cd ../react
echo "yarn install for @drift-labs/react"
yarn install
yarn link @drift-labs/sdk
yarn link @drift/common
yarn link @drift-labs/icons
yarn link
echo "cd ../../"
cd ../../superstake-ui
echo "yarn install for superstake-ui"
echo "$PWD"
yarn install
yarn link @drift/common 
yarn link @drift-labs/sdk 
yarn link @drift-labs/icons
yarn link @drift-labs/react
