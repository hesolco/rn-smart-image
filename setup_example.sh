#!/bin/bash
set -e

echo "🚀 Setting up example project..."

# 1. Initialize React Native app (skip install to speed up initial scaffold, we will install after)
# Using specific version to ensure compatibility
if [ ! -d "example" ]; then
  echo "📦 Initializing React Native app..."
  npx @react-native-community/cli init example --version 0.74.0 --skip-install
else
  echo "⚠️  'example' folder already exists. Skipping init."
fi

# 2. Copy our demo App.tsx
echo "📄 Copying demo code..."
cp setup/App.tsx example/App.tsx

# 3. Setup dependencies
echo "🔗 Linking library..."
cd example

# Add local library as dependency
yarn add file:../
# Add dependencies used in the example/library (netinfo, fs, etc)
yarn add react-native-fs @react-native-community/netinfo crypto-js

# 4. Install Pods (iOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🍎 Installing CocoaPods..."
  cd ios
  pod install
  cd ..
fi

echo "✅ Setup complete!"
echo "To run android: cd example && yarn android"
echo "To run ios:     cd example && yarn ios"
