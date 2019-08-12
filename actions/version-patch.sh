cd build
tag=$(npm version patch 2>&1)
tag=${tag#*@}
git push origin "$tag"