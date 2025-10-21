#!/bin/bash

echo "🚀 Preparing for deployment..."

# Build web app
echo "📦 Building web app..."
cd apps/web
pnpm install
pnpm build
cd ../..

# Build API
echo "🔧 Building API..."
cd apps/api
pnpm install
pnpm build
cd ../..

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
