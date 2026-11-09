#!/bin/sh
set -eu

# Named volumes start empty. Seed only immutable sample configuration; never
# overwrite documents, vectors or SQLite data that were created by the user.
mkdir -p /app/data/uploads /app/data/qdrant
for file in /seed/*.yaml; do
  [ -e "$file" ] || continue
  target="/app/data/$(basename "$file")"
  [ -e "$target" ] || cp "$file" "$target"
done

exec "$@"
