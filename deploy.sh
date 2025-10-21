#!/bin/bash

echo "🚀 Preparing for deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build both apps
echo "🔧 Building applications..."
pnpm build

echo "✅ Build completed successfully!"
echo "📝 Next steps:"
echo "1. Commit and push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy on Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repo"
echo "   - Add OPENAI_API_KEY environment variable"
echo "   - Deploy!"
echo ""
echo "3. Or deploy on Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repo"
echo "   - Add OPENAI_API_KEY environment variable"
echo "   - Deploy!"
