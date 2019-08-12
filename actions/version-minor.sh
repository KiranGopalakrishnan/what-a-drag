cd build
tag=$(npm version minor 2>&1)
tag=${tag#*@}
git push origin "$tag"