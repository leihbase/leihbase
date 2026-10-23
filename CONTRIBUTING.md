# Contributing

Thanks for your interest in contributing! Bug reports, feature ideas and pull
requests are welcome. For larger changes, please open an issue first to discuss
the idea.

## Project structure

- `web/`: the [Nuxt](https://nuxt.com/) front-end, including the admin section
- `pocketbase/`: the [PocketBase](https://pocketbase.io/) back-end
  - `pb_hooks/`: server-side logic, such as emails, reminders and custom routes
  - `pb_migrations/`: database schema migrations
- `tests/`: [Playwright](https://playwright.dev/) API and browser tests

## Development

### Setup

Requirements: [Mise](https://mise.jdx.dev) and [Docker](https://www.docker.com/)
(for running the tests)

```bash
# Install repository tools (mailpit, pocketbase)
$ mise install
# Setup project
$ mise run //...:setup
```

### Run

```bash
# Run services
$ mise run //...:dev
```

This starts PocketBase on [localhost:8090](http://localhost:8090), the front-end
on [localhost:3000](http://localhost:3000) and mailpit on
[localhost:8025](http://localhost:8025).

Environment variables are configured in `web/mise.toml` and
`pocketbase/mise.toml`, and can be overridden locally with a `.env` file in the
`web/` or `pocketbase/` directory.

### Initial content

To be able to use the application, follow the
[initial setup](./README.md#initial-setup) steps, using
[localhost:8090/\_/](http://localhost:8090/_/) for the PocketBase admin
interface and [localhost:3000](http://localhost:3000) for the front-end.

### Email

When starting the services, [mailpit](https://github.com/axllent/mailpit) also
starts. In PocketBase ([localhost:8090/\_/](http://localhost:8090/_/) >
Settings > Mail settings) the following SMTP values can be configured:

- SMTP server host: localhost
- Port: 1025
- Username: _\<empty>_
- Password: _\<empty>_

Any sent email can then be viewed in the mailpit web interface at
[localhost:8025](http://localhost:8025).

## Tests

Tests are configured and run using [Playwright](https://playwright.dev/), as the
tests include visual snapshot tests they are executed in a Docker environment.

### Run tests

```bash
# Run e2e tests
mise run test:e2e
# Run e2e tests, and update visual snapshots
mise run test:e2e:update
```

## Database changes

When PocketBase runs locally, changes made to collections in the PocketBase
admin interface are automatically written as migration files to
`pocketbase/pb_migrations/`. Commit these together with your changes.

## Code style

```bash
# Format code
$ pnpm format
# Check formatting
$ pnpm format:check
# Typecheck the front-end and PocketBase hooks
$ pnpm typecheck
```

The PocketBase hooks are typechecked using JSDoc and the types PocketBase
generates in `pocketbase/pb_data/types.d.ts` on start. After upgrading
PocketBase (`PB_VERSION`), start it once and commit the regenerated types.

## Pull requests

- Create pull requests against the `next` branch
- Make sure the tests pass, and update visual snapshots when the UI changed
  intentionally
