#!/bin/bash

action_name="$1"
if [ -z "${action_name-}" ]; then
    echo 'Syntax:'
    echo "$0 {action_name}"
    exit 1
fi

action_dir="src/${action_name}"
if [ ! -d "${action_dir}" ]; then
    echo "cannot find action '${action_name}'"
    exit 1
fi

echo "Running '$action_name'"

if [ ! -f .env ]; then
    echo ".env doesn't exist, creating one from .env.example"
    cp .env.example .env
fi

action_dir="src/${action_name}"
entrypoint="main.ts"

yarn dlx @github/local-action run "${action_dir}" "${entrypoint}" ".env"
