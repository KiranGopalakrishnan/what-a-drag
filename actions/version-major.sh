cd build
tag=$(npm version major 2>&1)
tag=${tag#*@}
git push origin "$tag"