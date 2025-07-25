#!/bin/bash

# The name of all available actions.
declare -a ACTIONS=("create-cut-pr" "create-release-pr")

# Additional files to copy into the built action.
declare -a ADDITIONAL_FILES=("README.md" "action.yaml")


# Temporary location to output build artefacts.
DIST_DIR="dist"

# Directory to output completed GitHub actions.
GITHUB_ACTIONS_DIR="../.github/actions"

build_action () {
    action_name="$1"
    action_dist="$DIST_DIR/${action_name}"
    action_index="src/${action_name}/index.ts"

    if [ ! -f $action_index ]; then
        echo "cannot find action '${action_name}'"
        exit 1
    fi

    echo "creating dist directory for action '${action_dist}'"
    mkdir -p "${action_dist}"

    echo "building '${action_name}'"

    echo ""
    yarn ncc build "${action_index}" -o "${action_dist}"
    echo ""

    echo "finished building '${action_name}'"
}

output_file () {
    src="$1"
    dst="$2"

    if [ ! -f $src ]; then
        echo "cannot find src file '$src'"
        exit 1
    fi

    if [ ! -f $dst ]; then
        echo "destination file '${dst}' already exists, removing"
        rm -f "${dst}"
    fi

    echo "copying file from '${src}' to '${dst}"
    cp "${src}" "${dst}"
}

output_action () {
    action_name="$1"
    action_dist="$DIST_DIR/${action_name}/index.js"
    action_dir="$GITHUB_ACTIONS_DIR/${action_name}"

    echo "clearing action directory"
    rm -rf "${action_dir}"
    mkdir -p "${action_dir}"

    output_file "${action_dist}" "${action_dir}/index.js"

    echo "copying additional files for '${action_name}'"
    for file in "${ADDITIONAL_FILES[@]}"
    do
        src="src/${action_name}/${file}"
        dst="${action_dir}/${file}"
        output_file "${src}" "${dst}"
    done

    # Automatically stage action.
    git add "${action_dir}"
}

clean () {
    echo "cleaning dist directory '$DIST_DIR'"
    rm -rf "$DIST_DIR"
}

# Ensure action is run from correct directory to prevent mistakes.
current_dir="$(basename $(pwd))"
if [ "$current_dir" != "actions" ]; then
    echo "only run within 'actions' directory"
    exit 1
fi

# Ensure there's nothing pending for git, to prevent loosing changes.
if [ -n "$(git status --porcelain)" ]; then
    echo "please stash or commit pending changes before continuing"

    echo ""
    git status --short

    exit 1
fi

# Ensure the output directory is clean
clean

# Build each action
for action in "${ACTIONS[@]}"
do
    build_action "${action}"
    echo ""

    output_action "${action}"
    echo ""
done

echo "finished building actions, please commit the built files."
echo ""
git status --short
