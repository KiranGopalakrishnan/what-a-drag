cd build
tag=$(npm version patch 2>&1)
tag=${tag#*@}
git tag -a "$tag" -m "$tag"
cd ..
git add .
git commit -m "$tag"
git push && git push --tags